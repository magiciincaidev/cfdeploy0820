import React, { useState } from 'react';
import ScenarioController from './ScenarioController';
import { defaultConversationData, procedureRules, evaluateConditions } from '../../data/call/procedureRules';

type CallPhase = 'pre-call' | 'during-call' | 'post-call';

function CallSupportScreen() {
  const [memberStatus, setMemberStatus] = useState({ isDelinquent: true });
  const [conversationData, setConversationData] = useState(defaultConversationData);
  const [currentPhase, setCurrentPhase] = useState<CallPhase>('during-call');
  const [checkboxStates, setCheckboxStates] = useState<{ [key: string]: boolean }>({});

  // 動的手続きの条件判定
  const activeProcedureResult = evaluateConditions(memberStatus, conversationData, checkboxStates);
  const activeProcedureData = activeProcedureResult 
    ? procedureRules[activeProcedureResult.category]?.[activeProcedureResult.situation]?.[activeProcedureResult.procedure]
    : null;

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setCheckboxStates(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleEndCall = () => {
    setCurrentPhase('post-call');
  };

  // Post-call screen (basic implementation)
  if (currentPhase === 'post-call') {
    return (
      <div className="bg-[#fcfcfc] min-h-screen p-8">
        <div className="bg-white rounded-lg border border-gray-400 p-6 text-center">
          <h1 className="text-2xl font-bold text-black mb-4">通話終了</h1>
          <p className="text-gray-600 mb-4">通話が終了しました。お疲れ様でした。</p>
          <button
            onClick={() => setCurrentPhase('pre-call')}
            className="px-6 py-3 bg-[#005dda] text-white rounded-lg hover:bg-blue-700"
          >
            新しい通話を開始
          </button>
        </div>
      </div>
    );
  }

  // During-call screen (main interface)
  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-black">業務支援AI - 架電中画面</h1>
          <button
            onClick={handleEndCall}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            通話終了
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Scenario Controller */}
        <ScenarioController
          conversationData={conversationData}
          setConversationData={setConversationData}
          memberStatus={memberStatus}
          setMemberStatus={setMemberStatus}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-gray-400 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 w-6 h-6 rounded"></div>
                <h2 className="text-lg font-bold text-black">顧客情報</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">会員番号</label>
                  <div className="bg-gray-100 rounded p-3">
                    <span className="font-medium">7110-00433(6471)</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">お名前</label>
                  <div className="bg-gray-100 rounded p-3">
                    <span className="font-medium">山田太郎</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">返済期日</label>
                  <div className="bg-gray-100 rounded p-3">
                    <span className="font-medium">2025/08/25</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">延滞金額</label>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <span className="font-bold text-red-700">¥25,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Section */}
            <div className="bg-white rounded-lg border border-gray-400 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 w-6 h-6 rounded"></div>
                <h3 className="text-lg font-bold text-black">オープニング</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm">お名前の確認をお願いします</span>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm">自己紹介（会社名・担当者名）</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Main Procedures */}
          <div className="lg:col-span-1 space-y-6">
            {/* 手続き Section */}
            <div className="bg-white rounded-lg border border-gray-400 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600 w-6 h-6 rounded"></div>
                <h3 className="text-lg font-bold text-black">手続き</h3>
              </div>
              
              {/* Dynamic Procedure Steps */}
              {activeProcedureData?.procedures?.map((section, sectionIndex) => {
                if (section.type !== '手続き') return null;
                
                const completedCount = section.items.filter(i => checkboxStates[i.id]).length;
                const totalCount = section.items.length;

                return (
                  <div key={sectionIndex} className="space-y-3">
                    {section.items.map((item, itemIndex) => {
                      const isChecked = checkboxStates[item.id] || false;
                      
                      return (
                        <div key={itemIndex} className="border rounded p-3 hover:bg-gray-50">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                              className="mt-1 w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={item.id}
                                className={`flex items-center gap-2 cursor-pointer ${
                                  isChecked ? 'line-through text-gray-500' : 'text-black'
                                }`}
                              >
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  item.required 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-orange-400 text-white'
                                }`}>
                                  {item.required ? '必須' : '推奨'}
                                </span>
                                <span className="font-medium">{item.text}</span>
                              </label>
                              
                              {item.details && (
                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                  {item.details.map((detail, detailIndex) => (
                                    <div key={detailIndex} className="pl-4 border-l-2 border-gray-200">
                                      {detail}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Progress Indicator */}
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">進捗: {completedCount}/{totalCount}</span>
                        <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`font-medium ${
                          completedCount === totalCount ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {Math.round((completedCount / totalCount) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scripts Section */}
            {activeProcedureData?.scripts && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-3">📝 スクリプト</h4>
                {Object.entries(activeProcedureData.scripts).map(([type, scripts]) => (
                  <div key={type} className="mb-3">
                    <h5 className="font-semibold text-blue-700 mb-2">{type}</h5>
                    <ul className="space-y-2">
                      {scripts.map((script, index) => (
                        <li key={index} className="text-sm text-blue-800 bg-white p-3 rounded border-l-4 border-blue-400">
                          {script}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Closing & Tips */}
          <div className="lg:col-span-1 space-y-6">
            {/* クロージング Section */}
            <div className="bg-white rounded-lg border border-gray-400 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-400 w-6 h-6 rounded"></div>
                <h3 className="text-lg font-bold text-black">クロージング</h3>
              </div>
              
              {/* Dynamic Closing Steps */}
              {activeProcedureData?.procedures?.map((section, sectionIndex) => {
                if (section.type !== 'クロージング') return null;

                return (
                  <div key={sectionIndex} className="space-y-3">
                    {section.items.map((item, itemIndex) => {
                      const isChecked = checkboxStates[item.id] || false;
                      
                      return (
                        <div key={itemIndex} className="border rounded p-3 hover:bg-gray-50">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                              className="mt-1 w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={item.id}
                                className={`flex items-center gap-2 cursor-pointer ${
                                  isChecked ? 'line-through text-gray-500' : 'text-black'
                                }`}
                              >
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  item.required 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-orange-400 text-white'
                                }`}>
                                  {item.required ? '必須' : '推奨'}
                                </span>
                                <span className="font-medium">{item.text}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Tips Section */}
            {activeProcedureData?.tips && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-3">💡 Tips</h4>
                <ul className="space-y-2">
                  {activeProcedureData.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-yellow-800 bg-white p-3 rounded border-l-4 border-yellow-400">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallSupportScreen;