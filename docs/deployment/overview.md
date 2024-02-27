# Deployment Overview

## OnLaunch SaaS Platform

If you prefer to skip dealing with hosting and maintaing the deployment of OnLaunch, checkout https://onlaunch.kula.app right now. Simply sign up, setup your app and integrate it using any of our [Client SDKs](/README.md#client-sdks).

## Self-Hosting Overview

If you instead prefer to host and maintain OnLaunch by yourself, this guide is the best place to start.

### Architecture

OnLaunch is a stateless REST API service which is accessed by the SDK clients and the web dashboard.

![Architecture Diagram](../res/architecture.png)

### Dependencies

To run OnLaunch you must at least fulfill the following requirements:

- PostgreSQL database (used as the main data storage)

For the full experience you should set up the following services:

- Redis (used to cache requests to external systems, like Stripe)
- SMTP Mail Server (to send emails during authentication)
- [Sentry.io](https://sentry.io) (used to collect crash and performance data)

Additional services used by [onlaunch.kula.app](https://onlaunch.kula.app) to provide the SaaS service:

- Stripe (used for managing subscriptions)

## Deploy on Docker

See the [`docker-compose.yml`](../../docker-compose.yml) for the minimal setup used for developing OnLaunch.

## Deploy on Kubernetes

To deploy a publicly accessible REST API service to Kubernetes you need at least the following resources:

- [Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) (to manage the resources)
- [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) (manages the containers deployed as Pods)
- [Service](https://kubernetes.io/docs/concepts/services-networking/service/) (routes internal network traffic to available Pods)
- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) (routes external network traffic to available services)

The exact details on how to configure the resources for your setup depends on your Kubernetes Cluster, therefore this section can only provide you rough guidance on how to create the resources.

1. Create a new working directory, ie. `onlaunch-deployment`
2. Create a new namespace specification `namespace.yaml`

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: onlaunch
```

3. Create a new deployment specification `deployment.yaml`

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: onlaunch
  name: onlaunch
  namespace: onlaunch
spec:
  replicas: 1
  selector:
    matchLabels:
      app: onlaunch
  strategy:
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
    type: RollingUpdate
  template:
    spec:
      containers:
        - name: onlaunch
          image: kula/onlaunch:0.6.0
          env:
            - name: PORT
              value: "3000"
            - name: DATABASE_URL
              value: "postgresql://onlaunch:password@localhost:5432/onlaunch?schema=public"
            - name: NEXTAUTH_SECRET
              value: "this should be something secret"
            - name: NEXTAUTH_URL
              value: https://<replace me with your domain>
          ports:
            - containerPort: 3000
              name: http
              protocol: TCP
```

4. Create a new service specification `service.yaml`

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: onlaunch
  namespace: onlaunch
  labels:
    app: onlaunch
spec:
  type: ClusterIP
  selector:
    app: onlaunch
  ports:
    - name: http
      port: 3000
      protocol: TCP
      targetPort: 3000
  sessionAffinity: None
```

5. Create a new ingress specification `ingress.yaml`

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: onlaunch
  namespace: onlaunch
  labels:
    name: onlaunch
spec:
  ingressClassName: nginx
  rules:
    - host: onlaunch.kula.app
      http:
        paths:
          - backend:
              service:
                name: onlaunch
                port:
                  number: 3000
            path: /
            pathType: Prefix
```

6. Use `kubectl` to apply the specifications to your cluster

```sh
kubectl apply -f *.yaml
```

## Considerations for Production

### Replicated Deployment

To a high-availability service you should consider deploying the OnLaunch REST API redundantly.

If you are using Kubernetes you can increase the `replicas` of your `Deployment` to a higher number and the `Service` will load balance requests between the deployed Pods.

Furthermore, you can auto-scale your replica count based on metrics, i.e. on CPU utilization, using an `HorizontalPodAutoscaler`:

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: onlaunch
  namespace: onlaunch
  labels:
    app: onlaunch
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: onlaunch
  minReplicas: 3
  maxReplicas: 12
  metrics:
    - resource:
        name: cpu
        target:
          averageUtilization: 85
          type: Utilization
      type: Resource
```

### Health Checks

The OnLaunch REST API offers a [standardized health endpoint](https://github.com/inadarei/rfc-healthcheck/blob/master/draft-inadarei-api-health-check-06.txt) `GET /health` which you can use to regularly determine if the server is healthy.

As this endpoint might contain some status data you do not want to be public, we decided to enforce the usage of an health API key. See the [Health Check documentation](../configuration.md#Health%20Check) for details on how to configure it.

Afterwards should be able to fetch the health status using the header `Authorization: token <YOUR HEALTH API KEY>`.

**Example Output:**

```json
{
  "status": "ok",
  "checks": {
    "uptime": [
      {
        "componentType": "system",
        "observedValue": 102917.25,
        "observedUnit": "s",
        "status": "ok",
        "time": "2024-02-22T15:12:56.388Z"
      }
    ],
    "postgres:connected": [
      {
        "status": "ok",
        "componentType": "datastore",
        "time": "2024-02-22T15:12:56.388Z"
      }
    ],
    "redis:connected": [
      {
        "status": "ok",
        "componentType": "datastore",
        "time": "2024-02-22T15:12:56.388Z"
      }
    ]
  }
}
```

### Using AWS SES (Simple Email Service) as an SMTP Server

- Create a new IAM user, ie. `onlaunch`
- Attach a user policy allowing the use of the actions `ses:SendEmail` and `ses:SendRawEmail`
- Create an SMTP access key for the user
