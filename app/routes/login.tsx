// import {
//   faAt,
//   faLock,
//   faTriangleExclamation,
// } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  type ActionArgs,
  type LoaderArgs,
  type MetaFunction,
  json,
  redirect,
} from '@remix-run/node';
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react';
import * as React from 'react';
import { verifyLogin } from '~/ldap.server';
import {
  createUserSession,
  getSession,
  getUserId,
  sessionStorage,
} from '~/session.server';
import { safeRedirect, validateEmail } from '~/utils';

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/');
  }

  const session = await getSession(request);
  const loginError = session.get('loginError') || null;

  return json(
    { loginError },
    {
      headers: {
        // only necessary with cookieSessionStorage
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    },
  );
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password');
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/');

  const errors: {
    email?: string;
    password?: string;
  } = {};

  if (!validateEmail(email)) {
    errors.email = 'Email is invalid';
  }
  if (typeof password !== 'string' || password.length === 0) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length) {
    return json({ errors: errors }, { status: 400 });
  }

  const { user, error } = await verifyLogin(email, password as string);

  if (error) {
    const session = await getSession(request);
    session.flash('loginError', error);
    throw redirect('/login', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  if (!user) {
    return json(
      { errors: { email: 'Invalid email or password', password: null } },
      { status: 400 },
    );
  }

  return createUserSession({
    request: request,
    userId: user.id,
    expiration: undefined,
    redirectTo,
  });
};

export const meta: MetaFunction = () => ({
  title: 'Login',
});

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const { loginError } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="hero ">
      <div className="hero-body">
        <div className="columns is-centered mt-5">
          <div className="column is-half-tablet is-one-quarter-desktop is-one-fifth-fullhd mt-5 box">
            <Form method="post" className="form">
              <h1 className="title is-1">Atlas Requests</h1>
              <input type="hidden" value={redirectTo} name="redirectTo" />
              {loginError ? (
                <article className="message is-danger ">
                  <div className="message-body p-2 is-flex">
                    <span className="icon mr-2">
                      {/*<FontAwesomeIcon icon={faTriangleExclamation} />*/}
                    </span>

                    <span>{loginError}</span>
                  </div>
                </article>
              ) : null}
              <div className="field">
                <label className="label">Email</label>
                <div className="control has-icons-left">
                  <input
                    ref={emailRef}
                    className="input"
                    name="email"
                    autoComplete="off"
                  />
                  <span className="icon is-small is-left">
                    {/*<FontAwesomeIcon icon={faAt} />*/}
                  </span>
                </div>
                {actionData?.errors?.email && (
                  <p className="help is-danger">{actionData.errors.email}</p>
                )}
              </div>
              <div className="field">
                <label className="label">Password</label>
                <div className="control has-icons-left">
                  <input
                    ref={passwordRef}
                    className="input"
                    type="password"
                    name="password"
                  />
                  <span className="icon is-small is-left">
                    {/*<FontAwesomeIcon icon={faLock} />*/}
                  </span>
                </div>
                {actionData?.errors?.password && (
                  <p className="help is-danger">{actionData.errors.password}</p>
                )}
              </div>
              <button
                className="button is-info is-fullwidth"
                type="submit"
                value="Submit"
              >
                Log In
              </button>
            </Form>
            <div className="has-text-grey my-5">
              &#169;
              {new Date().getFullYear()}&nbsp; Riverside Healthcare
            </div>
            <Link className="button is-fullwidth" to="/">
              Login with SAML
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
