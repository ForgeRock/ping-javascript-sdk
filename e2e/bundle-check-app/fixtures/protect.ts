import { protect } from '@forgerock/protect';

const api = protect({
  envId: 'example-env-id',
  behavioralDataCollection: true,
});

const startResult = await api.start();

if (startResult && 'error' in startResult) {
  console.error(startResult.error);
} else {
  const data = await api.getData();
  console.log(data);
}
