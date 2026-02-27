import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/Layout/AppLayout';
import { MobileBlock } from './components/Layout/MobileBlock';

export default function App() {
  return (
    <>
      <MobileBlock />
      <div className="hidden md:block h-screen w-screen overflow-hidden">
        <AppLayout />
      </div>
      <Toaster position="top-right" />
    </>
  );
}
