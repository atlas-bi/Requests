import type { RequestType } from '@prisma/client';
import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node';
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { MeiliSearch } from 'meilisearch';
import * as React from 'react';
import RequestTypeEditor from '~/components/RequestTypeEditor';
import {
  createRequestType,
  deleteRequestType,
  editRequestType,
  getRequestTypes,
} from '~/models/config.server';
import { groupIndex } from '~/search.server';
import { authenticator } from '~/services/auth.server';
import { requireUser } from '~/services/session.server';

type Errors = {
  typeName?: string;
  typeEditorName?: string;
  categoryName?: string;
  categoryDefault?: string;
  typeCreateName?: string;
};

export async function loader({ request, params }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });

  const requestTypes = await getRequestTypes();
  return json({
    requestTypes,
    user,
  });
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);

  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  const errors: Errors = {};

  switch (_action) {
    case 'editRequestType': {
      if (typeof values.name !== 'string' || values.name.length === 0) {
        errors.typeEditorName = 'Name is required';
        errors.id = Number(values.id);
      }
      if (Object.keys(errors).length > 0) {
        return json({ errors }, { status: 400 });
      }

      const {
        id,
        name,
        description,
        menuText,
        textFieldOneTitle,
        textFieldTwoTitle,
        textFieldThreeTitle,
        textFieldFourTitle,
        textFieldFiveTitle,
        booleanFieldOneTitle,
        booleanFieldTwoTitle,
        booleanFieldThreeTitle,
        userFieldOneTitle,
        userFieldTwoTitle,
        userFieldThreeTitle,
        labelsTitle,
        requesterTitle,
      } = values;

      await editRequestType({
        id: Number(id),
        name,
        description,
        menuText,
        /* groups */
        textFieldOneGroups: formData.getAll('textFieldOneGroups'),
        textFieldTwoGroups: formData.getAll('textFieldTwoGroups'),
        textFieldThreeGroups: formData.getAll('textFieldThreeGroups'),
        textFieldFourGroups: formData.getAll('textFieldFourGroups'),
        textFieldFiveGroups: formData.getAll('textFieldFiveGroups'),
        booleanFieldOneGroups: formData.getAll('booleanFieldOneGroups'),
        booleanFieldTwoGroups: formData.getAll('booleanFieldTwoGroups'),
        booleanFieldThreeGroups: formData.getAll('booleanFieldThreeGroups'),
        userFieldOneGroups: formData.getAll('userFieldOneGroups'),
        userFieldTwoGroups: formData.getAll('userFieldTwoGroups'),
        userFieldThreeGroups: formData.getAll('userFieldThreeGroups'),
        requesterGroups: formData.getAll('requesterGroups'),
        labelsGroups: formData.getAll('labelsGroups'),
        showTextFieldOne: values.showTextFieldOne === 'on',
        showTextFieldTwo: values.showTextFieldTwo === 'on',
        showTextFieldThree: values.showTextFieldThree === 'on',
        showTextFieldFour: values.showTextFieldFour === 'on',
        showTextFieldFive: values.showTextFieldFive === 'on',
        showBooleanFieldOne: values.showBooleanFieldOne === 'on',
        showBooleanFieldTwo: values.showBooleanFieldTwo === 'on',
        showBooleanFieldThree: values.showBooleanFieldThree === 'on',
        showUserFieldOne: values.showUserFieldOne === 'on',
        showUserFieldTwo: values.showUserFieldTwo === 'on',
        showUserFieldThree: values.showUserFieldThree === 'on',
        showRequester: values.showRequester === 'on',
        showLabels: values.showLabels === 'on',
        requireTextFieldOne: values.requireTextFieldOne === 'on',
        requireTextFieldTwo: values.requireTextFieldTwo === 'on',
        requireTextFieldThree: values.requireTextFieldThree === 'on',
        requireTextFieldFour: values.requireTextFieldFour === 'on',
        requireTextFieldFive: values.requireTextFieldFive === 'on',
        requireUserFieldOne: values.requireUserFieldOne === 'on',
        requireUserFieldTwo: values.requireUserFieldTwo === 'on',
        requireUserFieldThree: values.requireUserFieldThree === 'on',
        textFieldOneTitle,
        textFieldTwoTitle,
        textFieldThreeTitle,
        textFieldFourTitle,
        textFieldFiveTitle,
        booleanFieldOneTitle,
        booleanFieldTwoTitle,
        booleanFieldThreeTitle,
        userFieldOneTitle,
        userFieldTwoTitle,
        userFieldThreeTitle,
        labelsTitle,
        requesterTitle,
      });

      break;
    }
    case 'createRequestType': {
      if (typeof values.name !== 'string' || values.name.length === 0) {
        errors.typeCreateName = 'Name is required';
      }
      if (Object.keys(errors).length > 0) {
        return json({ errors }, { status: 400 });
      }
      const {
        name,
        description,
        menuText,
        textFieldOneTitle,
        textFieldTwoTitle,
        textFieldThreeTitle,
        textFieldFourTitle,
        textFieldFiveTitle,
        booleanFieldOneTitle,
        booleanFieldTwoTitle,
        booleanFieldThreeTitle,
        userFieldOneTitle,
        userFieldTwoTitle,
        userFieldThreeTitle,
        labelsTitle,
        requesterTitle,
      } = values;

      await createRequestType({
        name: name.toString(),
        description: description.toString(),
        menuText: menuText.toString(),
        /* groups */
        textFieldOneGroups: formData.getAll('textFieldOneGroups') as string[],
        textFieldTwoGroups: formData.getAll('textFieldTwoGroups') as string[],
        textFieldThreeGroups: formData.getAll(
          'textFieldThreeGroups',
        ) as string[],
        textFieldFourGroups: formData.getAll('textFieldFourGroups') as string[],
        textFieldFiveGroups: formData.getAll('textFieldFiveGroups') as string[],
        booleanFieldOneGroups: formData.getAll(
          'booleanFieldOneGroups',
        ) as string[],
        booleanFieldTwoGroups: formData.getAll(
          'booleanFieldTwoGroups',
        ) as string[],
        booleanFieldThreeGroups: formData.getAll(
          'booleanFieldThreeGroups',
        ) as string[],
        userFieldOneGroups: formData.getAll('userFieldOneGroups') as string[],
        userFieldTwoGroups: formData.getAll('userFieldTwoGroups') as string[],
        userFieldThreeGroups: formData.getAll(
          'userFieldThreeGroups',
        ) as string[],
        requesterGroups: formData.getAll('requesterGroups') as string[],
        labelsGroups: formData.getAll('labelsGroups') as string[],
        showTextFieldOne: values.showTextFieldOne === 'on',
        showTextFieldTwo: values.showTextFieldTwo === 'on',
        showTextFieldThree: values.showTextFieldThree === 'on',
        showTextFieldFour: values.showTextFieldFour === 'on',
        showTextFieldFive: values.showTextFieldFive === 'on',
        showBooleanFieldOne: values.showBooleanFieldOne === 'on',
        showBooleanFieldTwo: values.showBooleanFieldTwo === 'on',
        showBooleanFieldThree: values.showBooleanFieldThree === 'on',
        showUserFieldOne: values.showUserFieldOne === 'on',
        showUserFieldTwo: values.showUserFieldTwo === 'on',
        showUserFieldThree: values.showUserFieldThree === 'on',
        showRequester: values.showRequester === 'on',
        showLabels: values.showLabels === 'on',
        requireTextFieldOne: values.requireTextFieldOne === 'on',
        requireTextFieldTwo: values.requireTextFieldTwo === 'on',
        requireTextFieldThree: values.requireTextFieldThree === 'on',
        requireTextFieldFour: values.requireTextFieldFour === 'on',
        requireTextFieldFive: values.requireTextFieldFive === 'on',
        requireUserFieldOne: values.requireUserFieldOne === 'on',
        requireUserFieldTwo: values.requireUserFieldTwo === 'on',
        requireUserFieldThree: values.requireUserFieldThree === 'on',
        textFieldOneTitle: textFieldOneTitle.toString(),
        textFieldTwoTitle: textFieldTwoTitle.toString(),
        textFieldThreeTitle: textFieldThreeTitle.toString(),
        textFieldFourTitle: textFieldFourTitle.toString(),
        textFieldFiveTitle: textFieldFiveTitle.toString(),
        booleanFieldOneTitle: booleanFieldOneTitle.toString(),
        booleanFieldTwoTitle: booleanFieldTwoTitle.toString(),
        booleanFieldThreeTitle: booleanFieldThreeTitle.toString(),
        userFieldOneTitle: userFieldOneTitle.toString(),
        userFieldTwoTitle: userFieldTwoTitle.toString(),
        userFieldThreeTitle: userFieldThreeTitle.toString(),
        labelsTitle: labelsTitle.toString(),
        requesterTitle: requesterTitle.toString(),
        userId: user.id,
      });

      break;
    }
    case 'deleteRequestType': {
      await deleteRequestType({ id: Number(values.id) });
      break;
    }
    default: {
      console.log(`Unknown action ${_action}`);
      break;
      // throw new Error(`Unknown action ${_action}`);
    }
  }

  return null;
}

export default function Index() {
  const { requestTypes } = useLoaderData<typeof loader>();

  type ActionData = { errors?: Errors } | undefined | null;
  const actionData = useActionData<ActionData>();

  const typeNameRef = React.useRef<HTMLInputElement>(null);
  const [newTypeHidden, setNewTypeHidden] = React.useState(false);

  const transition = useNavigation();

  const isCreatingType =
    transition.state === 'submitting' &&
    transition.formData.get('_action') === 'createRequestType';

  React.useEffect(() => {
    if (!isCreatingType) {
      setNewTypeHidden(false);
    }
  }, [isCreatingType]);

  React.useEffect(() => {
    if (actionData?.errors?.typeName) {
      typeNameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <h3 className="text-lg font-medium">Request Types</h3>
      {requestTypes?.length > 0 &&
        requestTypes.map((rt: RequestType) => (
          <RequestTypeEditor key={rt.id} rt={rt} />
        ))}
      <RequestTypeEditor />
    </>
  );
}
