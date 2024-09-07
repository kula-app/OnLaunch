import createApp from '@/api/apps/createApp';
import Routes from '@/routes/routes';
import styles from '@/styles/Home.module.css';
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
} from '@chakra-ui/react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

export default function NewAppPage() {
  const router = useRouter();
  const toast = useToast();

  const orgId = Number(router.query.orgId);

  const [appName, setAppName] = useState('');

  function navigateToAppsPage() {
    router.push(Routes.getOrgAppsByOrgId(orgId));
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createApp(orgId, appName);

      toast({
        title: 'Success!',
        description: 'Apps has been created.',
        status: 'success',
        isClosable: true,
        duration: 6000,
      });

      resetForm();
      navigateToAppsPage();
    } catch (error) {
      toast({
        title: 'Error while creating new app!',
        description: `${error}`,
        status: 'error',
        isClosable: true,
        duration: 6000,
      });
    }
  }

  function resetForm() {
    (document.getElementById('appForm') as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          <Heading className="text-center">New App</Heading>
          <form className="mt-8" id="appForm" onSubmit={submitHandler}>
            <FormControl className="mt-4">
              <FormLabel>Name</FormLabel>
              <Input
                required
                id="name"
                onChange={(event) => setAppName(event.target.value)}
              />
            </FormControl>
            <div className="flex justify-center">
              <Button colorScheme="blue" className="mt-4" type="submit">
                save
              </Button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: Routes.login({
          redirect: context.req.url,
        }),
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
