import React, { useState } from 'react';
import { PreCallPhaseDataNew, samplePreCallPhaseData } from '../../data/precall/preCallPhaseData';

interface PreCallPhaseScreenProps {
  preCallPhaseData?: PreCallPhaseDataNew;
  onStartCall?: () => void;
}

const PreCallPhaseScreen: React.FC<PreCallPhaseScreenProps> = ({ 
  preCallPhaseData = samplePreCallPhaseData,
  onStartCall 
}) => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    attributeInfo: true,
    transactionInfo: true,
    contactHistory: true,
    tips: false
  });

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Removed helper functions since they're no longer needed

  return (
    <div className="bg-[#fcfcfc] min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-lg mb-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-black">業務支援AI - 架電前フェーズ</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* お客様への確認・説明事項（架電前） */}
        <div className="bg-white rounded-lg border border-gray-400 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-black mb-6">お客様への確認・説明事項（架電前）</h2>
          
          {/* 属性情報 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">属性情報</h3>
            <div className="space-y-4">
              {preCallPhaseData.attributeInfo.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={checkedItems[item.id] || false}
                      onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.priority === '必須' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-orange-400 text-white'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="font-semibold text-gray-900">{item.title}</span>
                      </div>
                      <p className="text-sm text-gray-700">{item.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 取引内容 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">取引内容</h3>
            <div className="space-y-4">
              {preCallPhaseData.transactionInfo.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={checkedItems[item.id] || false}
                      onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.priority === '必須' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-orange-400 text-white'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="font-semibold text-gray-900">{item.title}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{item.content}</p>
                      {item.details && (
                        <div className="mt-2 space-y-1">
                          {item.details.map((detail, index) => (
                            <div key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                              ・{detail}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* コンタクト履歴 */}
        <div className="bg-white rounded-lg border border-gray-400 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-black mb-4">コンタクト履歴（直近3回分表示）</h3>
          <div className="space-y-3">
            {preCallPhaseData.contactHistory.map((contact) => (
              <div key={contact.id} className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded-r">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900">
                    {contact.date}（{contact.time}）
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    contact.method === '勤務先' ? 'bg-blue-100 text-blue-800' :
                    contact.method === '携帯' ? 'bg-green-100 text-green-800' :
                    contact.method === '自宅' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {contact.method}
                  </span>
                </div>
                <p className="text-sm text-gray-700">∟{contact.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-lg border border-gray-400 p-4">
          <h3 className="text-lg font-semibold text-black mb-4">💡 Tips</h3>
          <div className="space-y-2">
            {preCallPhaseData.tips.map((tip) => (
              <div key={tip.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
                ・{tip.content}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call Start Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button
            onClick={onStartCall}
            className="px-8 py-3 rounded-lg font-semibold text-lg bg-[#005dda] text-white hover:bg-blue-700 shadow-lg transition-all"
          >
            架電する
          </button>
        </div>
      </div>

      {/* Bottom padding to prevent content from being hidden behind the fixed button */}
      <div className="h-20"></div>
    </div>
  );
};

export default PreCallPhaseScreen;