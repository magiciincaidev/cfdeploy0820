import React from 'react';
import { MemberStatus, ConversationData } from '../../data/call/procedureRules';

interface ScenarioControllerProps {
  conversationData: ConversationData;
  setConversationData: (data: ConversationData) => void;
  memberStatus: MemberStatus;
  setMemberStatus: (status: MemberStatus) => void;
}

const ScenarioController: React.FC<ScenarioControllerProps> = ({ 
  conversationData, 
  setConversationData, 
  memberStatus, 
  setMemberStatus 
}) => {
  const handleConversationChange = (key: keyof ConversationData, value: boolean) => {
    setConversationData({
      ...conversationData,
      [key]: value
    });
  };

  const handleMemberStatusChange = (key: keyof MemberStatus, value: boolean) => {
    setMemberStatus({
      ...memberStatus,
      [key]: value
    });
  };

  const getTagsByScenario = (scenarioType: string) => {
    switch (scenarioType) {
      case 'temporary':
        return ['一時約束の会話'];
      case 'hospitalization':
        return ['入院中の申出'];
      case 'long-term':
        return ['一時約束の会話', '支払希望日が30日超', '残高100万円超'];
      default:
        return [];
    }
  };

  const isScenarioActive = (scenarioType: string) => {
    const tags = getTagsByScenario(scenarioType);
    return tags.every(tag => {
      switch (tag) {
        case '一時約束の会話': return conversationData.hasTemporaryPromise;
        case '入院中の申出': return conversationData.hasHospitalization;
        case '療養中の申出': return conversationData.hasMedicalTreatment;
        case '支払希望日が30日超': return conversationData.paymentDateExceeds30Days;
        case '残高100万円超': return conversationData.balanceOver1Million;
        default: return false;
      }
    });
  };

  const activateScenario = (scenarioType: string) => {
    setMemberStatus({ isDelinquent: true });
    
    switch (scenarioType) {
      case 'temporary':
        setConversationData({
          hasTemporaryPromise: true,
          hasHospitalization: false,
          hasMedicalTreatment: false,
          paymentDateExceeds30Days: false,
          balanceOver1Million: false
        });
        break;
      case 'hospitalization':
        setConversationData({
          hasTemporaryPromise: false,
          hasHospitalization: true,
          hasMedicalTreatment: false,
          paymentDateExceeds30Days: false,
          balanceOver1Million: false
        });
        break;
      case 'long-term':
        setConversationData({
          hasTemporaryPromise: true,
          hasHospitalization: false,
          hasMedicalTreatment: false,
          paymentDateExceeds30Days: true,
          balanceOver1Million: true
        });
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-400 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-gray-600 font-medium">シナリオ:</span>
        
        {/* 一時約束シナリオ */}
        <button
          onClick={() => activateScenario('temporary')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isScenarioActive('temporary')
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>一時約束シナリオ</span>
            <div className="flex gap-1">
              {getTagsByScenario('temporary').map((tag) => (
                <span key={tag} className={`px-2 py-1 rounded text-xs ${
                  isScenarioActive('temporary')
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </button>

        {/* 入院・督促停止シナリオ */}
        <button
          onClick={() => activateScenario('hospitalization')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isScenarioActive('hospitalization')
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>入院・督促停止シナリオ</span>
            <div className="flex gap-1">
              {getTagsByScenario('hospitalization').map((tag) => (
                <span key={tag} className={`px-2 py-1 rounded text-xs ${
                  isScenarioActive('hospitalization')
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </button>

        {/* 高額・長期延滞シナリオ */}
        <button
          onClick={() => activateScenario('long-term')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isScenarioActive('long-term')
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>高額・長期延滞シナリオ</span>
            <div className="flex gap-1">
              {getTagsByScenario('long-term').map((tag) => (
                <span key={tag} className={`px-2 py-1 rounded text-xs ${
                  isScenarioActive('long-term')
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ScenarioController;