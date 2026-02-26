import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <div class="flex h-screen">
            <aside class="w-64 h-full bg-gray-50 border-r border-gray-200">
              <div class="h-full px-3 py-4 overflow-y-auto">
                <ul class="space-y-2">
                  <li>
                    <a href="/" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                      Index
                    </a>
                  </li>
                  <li>
                    <a href="/about" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                      About
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
            <div class="flex-1 overflow-auto">
              <Suspense>{props.children}</Suspense>
            </div>
          </div>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
