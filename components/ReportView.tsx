import React from 'react';
// Fix: Import types from the correct relative path.
import type { CaseDetails, AnalysisReport, TimelineEvent } from '../types';
import { CheckCircle, AlertTriangle, FileText, Globe, List, Target, Activity, MessageSquare, Info, Calendar } from './icons';

interface ReportViewProps {
  documentData: CaseDetails;
  onlineData: CaseDetails;
  analysisReport: AnalysisReport;
  onReset: () => void;
}

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-bold text-brand-primary mr-3">{title}</h3>
    </div>
    {children}
  </div>
);

const DataComparison: React.FC<{ doc: CaseDetails, web: CaseDetails }> = ({ doc, web }) => {
    const renderField = (label: string, docValue: any, webValue: any) => {
        const isDifferent = JSON.stringify(docValue) !== JSON.stringify(webValue);
        return (
            <div key={label} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
                <div className="text-sm font-semibold text-gray-600 col-span-1">{label}</div>
                <div className="text-sm text-gray-800 col-span-1">{docValue || 'غير متاح'}</div>
                <div className={`text-sm col-span-1 flex items-center ${isDifferent && docValue && webValue ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                    {webValue || 'غير متاح'}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 pb-2 font-bold text-gray-700">
                <div className="col-span-1">الحقل</div>
                <div className="col-span-1 flex items-center"><FileText className="h-4 w-4 ml-2" /> مصدر المستند</div>
                <div className="col-span-1 flex items-center"><Globe className="h-4 w-4 ml-2" /> مصدر عبر الإنترنت</div>
            </div>
            {renderField("رقم القضية", doc.numeroDossier, web.numeroDossier)}
            {renderField("المحكمة", doc.tribunal, web.tribunal)}
            {renderField("نوع القضية", doc.typeAffaire, web.typeAffaire)}
            {renderField("حالة القضية", doc.etatDossier, web.etatDossier)}
        </div>
    );
};

const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => (
    <div className="relative pr-8">
        {events.map((event, index) => (
            <div key={index} className="mb-8 relative">
                <div className="absolute right-[-34px] top-1.5 h-4 w-4 rounded-full bg-brand-accent z-10 border-4 border-white"></div>
                {index < events.length - 1 && <div className="absolute right-[-28px] top-4 h-full w-0.5 bg-gray-200"></div>}
                <p className="font-bold text-gray-800">{new Date(event.date).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-gray-600">{event.description}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 inline-block ${event.source === 'المستند' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {event.source}
                </span>
            </div>
        ))}
    </div>
);


const ReportView: React.FC<ReportViewProps> = ({ documentData, onlineData, analysisReport, onReset }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
          <h1 className="text-4xl font-extrabold text-brand-primary">تقرير تحليل القضية</h1>
          <p className="text-lg text-gray-600 mt-2">القضية: {documentData.numeroDossier}</p>
      </div>

      <InfoCard icon={<MessageSquare className="h-8 w-8 text-brand-accent"/>} title="ملخص تحليلي">
        <p className="text-gray-700 leading-relaxed">{analysisReport.resume}</p>
      </InfoCard>

      <div className="grid md:grid-cols-2 gap-8">
          <InfoCard icon={<AlertTriangle className="h-8 w-8 text-orange-500"/>} title="التناقضات ونقاط الاهتمام">
            {analysisReport.incoherences.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {analysisReport.incoherences.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            ) : (
                <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 ml-2" />
                    <p>لم يتم الكشف عن تناقضات كبيرة.</p>
                </div>
            )}
          </InfoCard>

          <InfoCard icon={<Info className="h-8 w-8 text-blue-500"/>} title="النقاط الرئيسية للتذكر">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
                {analysisReport.pointsCles.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </InfoCard>
      </div>
      
      <InfoCard icon={<List className="h-8 w-8 text-gray-500"/>} title="مقارنة البيانات">
        <DataComparison doc={documentData} web={onlineData} />
      </InfoCard>

      <div className="grid md:grid-cols-2 gap-8">
        <InfoCard icon={<Calendar className="h-8 w-8 text-purple-500"/>} title="الجدول الزمني للقضية">
            <Timeline events={analysisReport.timeline} />
        </InfoCard>

        <InfoCard icon={<Target className="h-8 w-8 text-green-500"/>} title="الخطوات التالية الموصى بها">
            <ul className="space-y-3">
                {analysisReport.prochainesEtapes.map((item, i) => (
                    <li key={i} className="flex items-start">
                        <Activity className="h-5 w-5 text-green-600 ml-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                    </li>
                ))}
            </ul>
        </InfoCard>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors text-lg"
        >
          تحليل مستند آخر
        </button>
      </div>
    </div>
  );
};

export default ReportView;
