import React from 'react';
import { Loader } from './icons';

interface ProcessingViewProps {
  step: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ step }) => {
  const messages = [
    "يرجى الانتظار، قد يستغرق التحليل بعض الوقت...",
    "الذكاء الاصطناعي يعمل من أجلك...",
    "جاري تجميع التقرير...",
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prev => {
        const currentIndex = messages.indexOf(prev);
        return messages[(currentIndex + 1) % messages.length];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full text-center flex flex-col items-center justify-center h-80">
      <Loader className="h-16 w-16 text-brand-primary animate-spin mb-6" />
      <h2 className="text-xl font-bold text-brand-primary mb-2">{step}</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default ProcessingView;