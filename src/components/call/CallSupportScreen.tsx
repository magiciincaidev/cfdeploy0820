import React, { useState } from 'react';
import ScenarioController from './ScenarioController';
import PreCallScreen from '../precall/PreCallPhaseScreen';
import { defaultConversationData, procedureRules, evaluateConditions } from '../../data/call/procedureRules';

const imgVector21 = "http://localhost:3845/assets/fb31b2f2228dd6800e004713eecb4df17b91b962.svg";
const imgLine79 = "http://localhost:3845/assets/c08a7209fb71c75ea9af6234a6ae3f6b96efd118.svg";
const imgLine77 = "http://localhost:3845/assets/7b00c42f35b2142e6f13f1b37e520d031710ba12.svg";
const imgLine80 = "http://localhost:3845/assets/179567fb4674a0a7c64bfc17a3a92e474642b7c1.svg";
const imgPolygon5 = "http://localhost:3845/assets/f0983459b4d812e6e6d0ee5b9f911f2d03f44e0a.svg";
const imgEllipse36 = "http://localhost:3845/assets/e901cd16af996f354f5a72cec3467d261ad3d9e0.svg";
const imgVector = "http://localhost:3845/assets/32aeceb851d72110e2bfd5fd7723c2eae039d25e.svg";

type CallPhase = 'pre-call' | 'during-call' | 'post-call';

function ResponsiveComponent() {
  const [memberStatus, setMemberStatus] = useState({ isDelinquent: true });
  const [conversationData, setConversationData] = useState(defaultConversationData);
  const [currentPhase, setCurrentPhase] = useState<CallPhase>('pre-call');
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

  const handleStartCall = () => {
    setCurrentPhase('during-call');
  };

  const handleEndCall = () => {
    setCurrentPhase('post-call');
  };

  // Pre-call screen
  if (currentPhase === 'pre-call') {
    return <PreCallScreen onStartCall={handleStartCall} />;
  }

  // Post-call screen (basic implementation)
  if (currentPhase === 'post-call') {
    return (
      <div className="bg-[#fcfcfc] min-h-screen p-4 md:p-6 lg:p-8">
        <div className="bg-white shadow-lg rounded-lg mb-6 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-semibold text-black">業務支援AI - 通話終了</h1>
            <button
              onClick={() => setCurrentPhase('pre-call')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              新しい架電を開始
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-400 p-6 text-center">
          <h2 className="text-xl font-bold text-green-600 mb-4">通話が終了しました</h2>
          <p className="text-gray-600 mb-6">通話記録の保存と後処理が完了しました。</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentPhase('during-call')}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              通話内容を確認
            </button>
            <button
              onClick={() => setCurrentPhase('pre-call')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              次の架電準備
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-lg mb-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-black">業務支援AI</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              山田太郎 様 (7110-00433(6471))
            </div>
            <button
              onClick={() => setCurrentPhase('pre-call')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              架電前に戻る
            </button>
            <button
              onClick={handleEndCall}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              通話終了
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Controller */}
      <ScenarioController 
        conversationData={conversationData}
        setConversationData={setConversationData}
        memberStatus={memberStatus}
        setMemberStatus={setMemberStatus}
      />

      {/* Status Pills */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center md:justify-start">
        <div className="text-lg font-medium text-black mb-2 w-full md:w-auto text-center md:text-left">ステータス</div>
        <div className="flex gap-2 flex-wrap justify-center md:justify-start">
          <div className={`rounded-full px-4 py-2 text-sm ${
            currentPhase === 'pre-call' ? 'bg-[#005dda] text-white' : 'bg-gray-300 text-gray-700'
          }`}>通話前</div>
          <div className={`rounded-full px-4 py-2 text-sm ${
            currentPhase === 'during-call' ? 'bg-[#005dda] text-white' : 'bg-gray-300 text-gray-700'
          }`}>通話中</div>
          <div className={`rounded-full px-4 py-2 text-sm ${
            currentPhase === 'post-call' ? 'bg-[#005dda] text-white' : 'bg-gray-300 text-gray-700'
          }`}>通話後</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Member Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-400 p-4 space-y-4">
            <h2 className="text-lg font-semibold text-black border-b pb-2">会員情報</h2>
            
            <div>
              <label className="text-sm text-black mb-1 block">会員番号</label>
              <div className="bg-gray-100 rounded p-3">
                <span className="font-medium text-lg">7110-00433(6471)</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-black mb-1 block">名前</label>
              <div className="bg-gray-100 rounded p-3">
                <span className="font-medium text-lg">山田太郎</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-black mb-1 block">返済日</label>
              <div className="bg-gray-100 rounded p-3">
                <span className="font-semibold text-lg">8/25</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-black mb-1 block">返済額</label>
              <div className="bg-gray-100 rounded p-3">
                <span className="font-semibold text-lg">25,000円</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-black mb-1 block">コンタクト履歴（サマリ）</label>
              <div className="bg-gray-100 rounded p-3 text-sm space-y-2">
                <p className="mb-1">メモ：</p>
                <p className="mb-1">7月に延滞の連絡があり、8月2日に一時約束を取り付け。</p>
                <p className="mb-1">
                  <span className="text-yellow-500">⚠</span>
                  <span>️注意事項：</span>
                </p>
                <p>過去に職場架電でクレームがあったので、職場への連絡をしないように注意。</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-black mb-1 block">移管確率</label>
              <div className="bg-gray-100 rounded p-3">
                <span className="font-semibold text-xl">60%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">{/* Dynamic content will be integrated into existing sections */}

          {/* Opening Section */}
          <div className="bg-white rounded-lg border border-gray-400 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#005dda] w-6 h-6 rounded"></div>
              <h2 className="text-lg md:text-xl font-bold text-black">オープニング</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">必須</div>
                <span className="font-bold text-base md:text-lg">本人確認の上でプロミスだと名乗る</span>
              </div>
              
              <div className="text-sm space-y-2">
                <p>○○ ○○さまのお電話でよろしいでしょうか？</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>私、プロミスの○○と申します</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="text-sm">
                  <ul className="list-disc list-inside">
                    <li>貸金業法xx条に基づき、「氏名、生年月日、電話番号もしくは住所」の3点による本人確認が取れるまで、プロミスであることをお客さまに伝えることはNG</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="bg-white rounded-lg border border-gray-400 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#005dda] w-6 h-6 rounded"></div>
              <h2 className="text-lg md:text-xl font-bold text-black">要件特定</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">必須</div>
                <span className="font-bold text-base md:text-lg">今回の電話の要件を伝える</span>
              </div>
              
              <div className="text-sm">
                <p>今回、お客さまは○月○日に○○○円のお支払いが必要でしたが、現時点までに確認が取れておりませんでした。ご状況についてお伺いしてもよろしいでしょうか？</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    <li>「支払いが難しい＝悪意」とは限らないため、非詰問的な聞き方をする</li>
                    <li>まずは事情をヒアリングして、長期滞納リスクや支払意欲の判断材料を得る</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Inquiry Section */}
          <div className="bg-white rounded-lg border border-gray-400 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium">推奨</div>
              <span className="font-bold text-base md:text-lg">事情について詳細深掘り質問をする</span>
            </div>
            
            <div className="text-sm space-y-2">
              <p>(例) 差し支えなければ、どういったご事情か少し詳しくお聞かせいただけますか？</p>
              <p>(例) 出費というのは日常の生活のご都合でしょうか？それとも、急なご予定などがあったのでしょうか？</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded p-3 mt-4">
              <div className="text-sm">
                <ul className="list-disc list-inside">
                  <li>お客さまは<span className="font-bold underline">移管確率60%</span>のため、返済履行率を高めるために事実と今後の収支見込みを確認する</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dynamic Procedure Section */}
          <div className="bg-white rounded-lg border border-gray-400 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white border border-black w-6 h-6 rounded"></div>
              <h2 className="text-lg md:text-xl font-bold text-black">手続き</h2>
              {activeProcedureResult && (
                <div className="bg-[#005dda] text-white px-4 py-2 rounded-full text-sm font-medium flex-1 text-center max-w-xs">
                  {activeProcedureResult.situation}
                </div>
              )}
            </div>
            
            {/* Dynamic Procedure Steps */}
            {activeProcedureData?.procedures?.map((section, sectionIndex) => {
              if (section.type !== '手続き') return null;
              
              const completedCount = section.items.filter(i => checkboxStates[i.id]).length;
              const totalCount = section.items.length;

              return (
                <div key={sectionIndex} className="space-y-4">
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
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.required 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-orange-400 text-white'
                              }`}>
                                {item.required ? '必須' : '推奨'}
                              </span>
                              <span className={`font-bold text-base md:text-lg ${
                                isChecked ? 'line-through text-gray-500' : 'text-black'
                              }`}>
                                {item.text}
                              </span>
                            </div>
                            
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

                  {/* Dynamic Scripts */}
                  {activeProcedureData.scripts?.['手続き'] && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                      <h4 className="font-bold text-blue-800 mb-2">📝 スクリプト</h4>
                      <ul className="space-y-1">
                        {activeProcedureData.scripts['手続き'].map((script, index) => (
                          <li key={index} className="text-sm text-blue-800 bg-white p-2 rounded border-l-4 border-blue-400">
                            {script}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Dynamic Tips */}
                  {activeProcedureData.tips && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                      <h4 className="font-bold text-yellow-800 mb-2">💡 Tips</h4>
                      <ul className="space-y-2">
                        {activeProcedureData.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-yellow-800 bg-white p-2 rounded border-l-4 border-yellow-400">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Static Payment Options (when no dynamic procedure) */}
            {!activeProcedureData && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">必須</div>
                  <span className="font-bold text-base md:text-lg">お客さまと返済期日・金額を交渉する</span>
                </div>
                
                <div className="text-sm">
                  <p>それでは、お客さまのご事情を踏まえ、○○日に○○円はお支払い可能でしょうか？</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-300 rounded p-4 text-center">
                    <div className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm mb-3 inline-block">第1案</div>
                    <div className="font-bold text-base mb-2">2025年8月15日</div>
                    <div className="font-bold text-lg">¥12,000</div>
                  </div>
                  
                  <div className="bg-white border border-gray-300 rounded p-4 text-center">
                    <div className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm mb-3 inline-block">第2案</div>
                    <div className="font-bold text-base mb-2">2025年8月31日</div>
                    <div className="font-bold text-lg">¥3,000（利息のみ）</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="bg-white rounded-lg border border-gray-400 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium">推奨</div>
              <span className="font-bold text-base md:text-lg">支払い方法を確認する</span>
            </div>
            
            <div className="text-sm">
              <p>お客さまは前回ATMでお支払いをされていますが、○○日のお支払いはいかがなさいますか？</p>
            </div>
          </div>

          {/* Fee Information Section */}
          <div className="bg-white rounded-lg border border-gray-400 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium">推奨</div>
              <span className="font-bold text-base md:text-lg">手数料を案内する</span>
            </div>
            
            <div className="text-sm">
              <p>提携ATMでのご返済の場合、別途手数料（※）がかかります。※10,000円以下110円、10,001円以上220円</p>
            </div>
          </div>

          {/* Dynamic Closing Section */}
          <div className="bg-white rounded-lg border border-gray-400 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white border border-black w-6 h-6 rounded"></div>
              <h2 className="text-lg md:text-xl font-bold text-black">クロージング</h2>
            </div>
            
            {/* Dynamic Closing Steps */}
            {activeProcedureData?.procedures?.map((section, sectionIndex) => {
              if (section.type !== 'クロージング') return null;
              
              const completedCount = section.items.filter(i => checkboxStates[i.id]).length;
              const totalCount = section.items.length;

              return (
                <div key={sectionIndex} className="space-y-4">
                  {section.items.map((item, itemIndex) => {
                    const isChecked = checkboxStates[item.id] || false;
                    
                    return (
                      <div key={itemIndex} className="space-y-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={item.id}
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.required 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-orange-400 text-white'
                              }`}>
                                {item.required ? '必須' : '推奨'}
                              </span>
                              <span className={`font-bold text-base md:text-lg ${
                                isChecked ? 'line-through text-gray-500' : 'text-black'
                              }`}>
                                {item.text}
                              </span>
                            </div>
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

                  {/* Dynamic Scripts for Closing */}
                  {activeProcedureData.scripts?.['クロージング'] && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                      <h4 className="font-bold text-blue-800 mb-2">📝 スクリプト</h4>
                      <ul className="space-y-1">
                        {activeProcedureData.scripts['クロージング'].map((script, index) => (
                          <li key={index} className="text-sm text-blue-800 bg-white p-2 rounded border-l-4 border-blue-400">
                            {script}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Static Closing Steps (when no dynamic procedure) */}
            {!activeProcedureData && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">必須</div>
                    <span className="font-bold text-base md:text-lg">次回の期日・支払額を確認する</span>
                  </div>
                  
                  <div className="text-sm">
                    <p>それでは、○○○○年○月○日までに、提携ATMでのお振込ということで承りました。</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium">推奨</div>
                    <span className="font-bold text-base md:text-lg">次回期日までは督促が停止されることを案内する</span>
                  </div>
                  
                  <div className="text-sm">
                    <p>このお電話をもって、今後は○月○日までお客さまに督促のご連絡がいかないようお手続きいたしますので、ご安心ください。</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium">推奨</div>
                    <span className="font-bold text-base md:text-lg">お客さまからの質問がないかを確認する</span>
                  </div>
                  
                  <div className="text-sm">
                    <p>私からのご連絡は以上となりますが、最後にお客さまから気になることなどはございませんか？</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallSupportScreen() {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <ResponsiveComponent />
    </div>
  );
}