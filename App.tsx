import React, { useState } from 'react';
import { Header, Footer } from './components/Layout';
import FileUpload from './components/FileUpload';
import ProcessingView from './components/ProcessingView';
import ReportView from './components/ReportView';
import { analyzeCaseDocument, generateReportFromManualInput } from './services/geminiService';
import type { CaseDetails, AnalysisReport } from './types';

type View = 'upload' | 'processing' | 'report';

const App: React.FC = () => {
  const [view, setView] = useState<View>('upload');
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState('');

  const [documentData, setDocumentData] = useState<CaseDetails | null>(null);
  const [onlineData, setOnlineData] = useState<CaseDetails | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);

  const handleFileUpload = async (fileContent: string) => {
    setView('processing');
    setError(null);
    try {
      setProcessingStep('جاري استخراج البيانات من المستند...');
      const result = await analyzeCaseDocument(fileContent);

      setProcessingStep('جاري تحليل البيانات ومقارنتها...');
      setDocumentData(result.documentData);
      setOnlineData(result.onlineData);
      setAnalysisReport(result.analysisReport);
      
      setProcessingStep('اكتمل التحليل بنجاح!');
      setView('report');

    } catch (e) {
      const err = e as Error;
      setError(`حدث خطأ أثناء التحليل: ${err.message}`);
      setView('upload');
    }
  };

  const handleManualSubmit = async (manualData: CaseDetails) => {
    setView('processing');
    setError(null);
    try {
      setProcessingStep('جاري البحث عن بيانات القضية عبر الإنترنت...');
      const result = await generateReportFromManualInput(manualData);
      
      setProcessingStep('جاري تحليل البيانات ومقارنتها...');
      setDocumentData(result.documentData);
      setOnlineData(result.onlineData);
      setAnalysisReport(result.analysisReport);
      
      setProcessingStep('اكتمل التحليل بنجاح!');
      setView('report');
    } catch (e) {
      const err = e as Error;
      setError(`حدث خطأ أثناء التحليل: ${err.message}`);
      setView('upload');
    }
  };

  const handleReset = () => {
    setView('upload');
    setError(null);
    setDocumentData(null);
    setOnlineData(null);
    setAnalysisReport(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'upload':
        return (
            <FileUpload
                onFileUpload={handleFileUpload}
                onManualSubmit={handleManualSubmit}
                setProcessing={(isProcessing) => {
                    if (isProcessing) {
                        setView('processing');
                        setProcessingStep('جاري رفع المستند...');
                    }
                }}
                setError={setError}
            />
        );
      case 'processing':
        return <ProcessingView step={processingStep} />;
      case 'report':
        if (documentData && onlineData && analysisReport) {
          return (
            <ReportView
              documentData={documentData}
              onlineData={onlineData}
              analysisReport={analysisReport}
              onReset={handleReset}
            />
          );
        }
        // Fallback in case state is inconsistent
        handleReset();
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">خطأ!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}
            {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;