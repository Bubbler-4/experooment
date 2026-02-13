import { Route } from '@solidjs/router';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Experiment from './pages/Experiment';

function App() {
  return (
    <div class="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div class="ml-64 flex-1 p-4">
        <main class="bg-white rounded-lg shadow-sm min-h-full">
          <Route path="/" component={Home} />
          <Route path="/experiment" component={Experiment} />
        </main>
      </div>
    </div>
  );
}

export default App;
