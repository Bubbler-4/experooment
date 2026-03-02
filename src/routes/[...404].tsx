import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";

export default function NotFound() {
  return (
    <main class="p-4 text-center">
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Page Not Found
      </h1>
      <p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank" class="text-blue-600 hover:underline dark:text-blue-500">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}
