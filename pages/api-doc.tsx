import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const DynamicSwaggerUI = dynamic(() =>
  import('swagger-ui-react').then((mod) => mod.default)
);

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  return <DynamicSwaggerUI spec={spec} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const spec: Record<string, any> = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'OnLaunch - Next Swagger API',
        version: '1.0',
      },
    },
  });

  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc;
