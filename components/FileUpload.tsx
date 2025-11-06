import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from './icons';
import type { CaseDetails } from '../types';
import moroccanCourts from '../data/moroccanCourts.json';
import mahakimCategories from '../data/mahakimCategories.json';
import { extractTextFromImage } from '../services/geminiService';

interface FileUploadProps {
  onFileUpload: (content: string) => void;
  onManualSubmit: (data: CaseDetails) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
}

type Tab = 'upload' | 'manual';

const FileUploader: React.FC<Omit<FileUploadProps, 'onManualSubmit'>> = ({ onFileUpload, setProcessing, setError }) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) {
            setError("نوع الملف غير مدعوم. يرجى تحميل ملف نصي، PDF، DOCX، PNG، أو JPEG.");
            return;
        }

        const file = acceptedFiles[0];
        setProcessing(true);
        setError(null);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = async () => {
            const content = reader.result as string;
            if (file.type.startsWith('image/')) {
                try {
                    const extractedText = await extractTextFromImage(content);
                    onFileUpload(extractedText);
                } catch (ocrError) {
                    setError('فشل استخراج النص من الصورة.');
                    setProcessing(false);
                    console.error("OCR Error:", ocrError);
                }
            } else {
                onFileUpload(content);
            }
        };
        reader.onerror = () => {
            setError('فشل في قراءة الملف.');
            setProcessing(false);
        };

        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file); // Read image as Data URL
        } else {
            reader.readAsText(file); // Read text-based files as text
        }
    }, [onFileUpload, setProcessing, setError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg', '.jpg']
        },
        maxFiles: 1,
    });

    return (
        <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed w-full text-center cursor-pointer transition-colors duration-300 rounded-b-xl
            ${isDragActive ? 'border-brand-primary bg-blue-50' : 'border-gray-300 hover:border-brand-primary'}`}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center h-64">
                <UploadCloud className="h-16 w-16 text-gray-400 mb-4" />
                {isDragActive ? (
                <p className="text-xl font-semibold text-brand-primary">أفلت الملف هنا ...</p>
                ) : (
                <>
                    <p className="text-xl font-semibold text-gray-700">اسحب وأفلت ملف القضية هنا، أو انقر للتحديد</p>
                    <p className="text-sm text-gray-500 mt-2">يدعم ملفات PDF, DOCX, TXT, PNG, JPEG</p>
                </>
                )}
                {fileName && !isDragActive && (
                    <p className="text-sm text-gray-600 mt-4">الملف المحدد: {fileName}</p>
                )}
            </div>
        </div>
    );
};

const ManualInputForm: React.FC<Pick<FileUploadProps, 'onManualSubmit' | 'setError'>> = ({ onManualSubmit, setError }) => {
    const [caseNum1, setCaseNum1] = useState('741');
    const [caseNum2, setCaseNum2] = useState('2102');
    const [caseNum3, setCaseNum3] = useState('2025');
    const [selectedCourtName, setSelectedCourtName] = useState('محكمة الاستئناف بالدار البيضاء');
    const [selectedCategory, setSelectedCategory] = useState(mahakimCategories[0].id);
    const [includePrimary, setIncludePrimary] = useState(false);

    const selectedCourt = moroccanCourts.find(court => court.name === selectedCourtName);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!caseNum1 || !caseNum2 || !caseNum3 || !selectedCourtName) {
        setError('يرجى ملء جميع الحقول المطلوبة.');
        return;
      }
      setError(null);
      onManualSubmit({
        numeroDossier: `${caseNum1}/${caseNum2}/${caseNum3}`,
        tribunal: selectedCourtName,
        category: selectedCategory,
      });
    };
  
    return (
      <div className="p-8 border border-t-0 border-gray-200 w-full rounded-b-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-right">الرقم الكامل للملف</label>
            <div className="flex items-center space-x-2 space-x-reverse">
              <input type="text" value={caseNum1} onChange={(e) => setCaseNum1(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-center" />
              <span className="text-gray-500">/</span>
              <input type="text" value={caseNum2} onChange={(e) => setCaseNum2(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-center" />
              <span className="text-gray-500">/</span>
              <input type="text" value={caseNum3} onChange={(e) => setCaseNum3(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-center" />
            </div>
          </div>
          <div>
            <label htmlFor="court" className="block text-sm font-bold text-gray-700 mb-2 text-right">محاكم الإستئناف</label>
            <select id="court" value={selectedCourtName} onChange={(e) => setSelectedCourtName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
              {moroccanCourts.filter(court => includePrimary ? true : court.type === 'استئناف').map((courtOption) => (
                <option key={courtOption.name} value={courtOption.name}>{courtOption.name}</option>
              ))}
            </select>
            {selectedCourt && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-700">
                <p><strong>المدينة:</strong> {selectedCourt.city}</p>
                <p><strong>العنوان:</strong> {selectedCourt.address}</p>
                <p><strong>الاتصال:</strong> {selectedCourt.contact}</p>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2 text-right">فئة الملف</label>
            <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
              {mahakimCategories.map((categoryOption) => (
                <option key={categoryOption.id} value={categoryOption.id}>{categoryOption.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              id="includePrimary"
              type="checkbox"
              checked={includePrimary}
              onChange={(e) => setIncludePrimary(e.target.checked)}
              className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
            />
            <label htmlFor="includePrimary" className="mr-2 block text-sm text-gray-900">
              هل تريد البحث بالمحاكم الابتدائية
            </label>
          </div>
          <div>
            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors text-lg">
              بحث
            </button>
          </div>
        </form>
      </div>
    );
};
  
const FileUpload: React.FC<FileUploadProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('upload');

    const tabStyle = "px-6 py-3 font-semibold text-lg transition-colors duration-200 focus:outline-none";
    const activeTabStyle = "border-b-4 border-brand-primary text-brand-primary";
    const inactiveTabStyle = "text-gray-500 hover:text-brand-primary";

    return (
        <div className="bg-white rounded-xl shadow-lg">
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`${tabStyle} ${activeTab === 'upload' ? activeTabStyle : inactiveTabStyle}`}
                >
                    تحميل مستند
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`${tabStyle} ${activeTab === 'manual' ? activeTabStyle : inactiveTabStyle}`}
                >
                    إدخال يدوي
                </button>
            </div>
            {activeTab === 'upload' ? <FileUploader {...props} /> : <ManualInputForm {...props} />}
        </div>
    );
};

export default FileUpload;