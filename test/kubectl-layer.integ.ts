import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cr from 'aws-cdk-lib/custom-resources';

import { KubectlV28Layer } from '../lib';

/**
 * Test verifies that kubectl and helm are invoked successfully inside Lambda runtime.
 */

const app = new cdk.App();
const stack = new cdk.Stack(app, 'lambda-layer-kubectl-integ-stack');
const layer = new KubectlV28Layer(stack, 'KubectlLayer');

const runtimes = [
  lambda.Runtime.PYTHON_3_7,
  lambda.Runtime.PYTHON_3_9,
];

for (const runtime of runtimes) {
  const provider = new cr.Provider(stack, `Provider${runtime.name}`, {
    onEventHandler: new lambda.Function(stack, `Lambda$${runtime.name}`, {
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-handler')),
      handler: 'index.handler',
      runtime: runtime,
      layers: [layer],
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
    }),
  });

  new cdk.CustomResource(stack, `CustomResource${runtime.name}`, {
    serviceToken: provider.serviceToken,
  });
}

app.synth();
