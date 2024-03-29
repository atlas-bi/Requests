import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node';
import { safeRedirect } from 'remix-utils';
import { authenticator } from '~/services/auth.server';

export let action: ActionFunction = ({ request }) => login(request);
export let loader: LoaderFunction = ({ request }) => login(request);

async function login(request: Request) {
  if ([...authenticator.strategies].filter((x) => x[0] == 'saml').length > 0) {
    return authenticator.authenticate('saml', request);
  } else {
    const url = new URL(request.url);
    const returnTo = safeRedirect(url.searchParams.get('returnTo') || '/');
    return redirect(`/login?returnTo=${encodeURI(returnTo)}`);
  }
}
