// Type definitions
export interface MemberStatus {
  isDelinquent: boolean;
}

export interface ConversationData {
  hasTemporaryPromise: boolean;
  hasHospitalization: boolean;
  hasMedicalTreatment: boolean;
  paymentDateExceeds30Days: boolean;
  balanceOver1Million: boolean;
}

export interface ProcedureItem {
  id: string;
  text: string;
  required: boolean;
  details?: string[];
}

export interface ProcedureSection {
  type: string;
  items: ProcedureItem[];
}

export interface ProcedureData {
  description: string;
  conditions: string;
  procedures: ProcedureSection[];
  scripts?: { [key: string]: string[] };
  tips?: string[];
}

export const procedureRules: { [key: string]: { [key: string]: { [key: string]: ProcedureData } } } = {
  "営業会員（延滞）": {
    "一時約束": {
      "一時約束／非延滞A": {
        description: "会員本人と当社オペレーター間で合意した、今回の支払予定日を一時約束日としてCOReへ登録するもの",
        conditions: "最適化AIモデル\n非延滞A",
        procedures: [
          {
            type: "手続き",
            items: [
              {
                id: "confirm_payment_date",
                text: "会員の支払希望日を確認してください",
                required: true,
                details: [
                  "会員本人の支払希望日が、支払期日から30日以内であれば、以下の確認を行ってください。",
                  "・（必須）支払希望日",
                  "・（必須）支払予定金額", 
                  "・（必須）支払方法",
                  "会員本人の支払希望日が、支払期日から30日超であれば、追加で以下の確認を行ってください。",
                  "・（推奨）支払が困難である理由",
                  "・（推奨）支払希望日に支払できる根拠"
                ]
              },
              {
                id: "confirm_agreement",
                text: "会員と合意した支払予定日を確認してください",
                required: true
              },
              {
                id: "register_promise",
                text: "電話を保留し、一時約束日の登録を行ってください", 
                required: true
              },
              {
                id: "read_confirmation",
                text: "登録した一時約束日を読み上げ、お客様へ確認してください",
                required: true
              }
            ]
          },
          {
            type: "クロージング",
            items: [
              {
                id: "check_questions",
                text: "不明点の確認",
                required: false
              },
              {
                id: "thank_time",
                text: "時間を頂いた事に対するお礼を述べる",
                required: false
              },
              {
                id: "introduce_self",
                text: "名乗り",
                required: false
              }
            ]
          }
        ],
        scripts: {
          "手続き": [
            "②〇月〇日でお約束日を登録致します。少々お待ち頂けますでしょうか。",
            "④〇月〇日でお約束日を登録致しました。お間違いないでしょうか。"
          ],
          "クロージング": [
            "ご不明な点、ご質問はございませんか。",
            "お忙しいところお時間を頂きありがとうございました。",
            "私〇〇が承りました。"
          ]
        },
        tips: [
          "残高が100万円を超えるケースにおいては、1日あたりの遅延利息額を案内し、支払希望日より前での支払可否を確認してください",
          "支払希望日が支払期日から30日を超過する場合、延滞による与信減額の可能性、長期延滞により信用情報へ悪影響が出る可能性を説明し、30日以内の支払可否を確認してください",
          "支払希望日が支払期日から30日を超過する場合、30日以内での日付・最低必要金額を提案し、支払可否を確認してください"
        ]
      }
    }
  },
  "すべて": {
    "督促停止": {
      "督促停止（本人申出／入院・療養）": {
        description: "会員本人が以下の状況である事を聴取した場合、督促停止を設定するもの。\n・入院、療養･･･病気や事故、怪我を理由に、入院中、治療中、リハビリ中、静養や安静が必要である状態",
        conditions: "会話中に会員本人が入院中、入院予定、リハビリ中、治療中、自宅療養中である事を判定した場合",
        procedures: [
          {
            type: "手続き",
            items: [
              {
                id: "set_suspension",
                text: "督促停止設定が必要です。次の事項を確認してください。",
                required: true,
                details: [
                  "但し、お客様の状況に配慮し可能な範囲で確認します。",
                  "・（推奨）入院、療養理由",
                  "・（必須）退院予定、療養期間", 
                  "・（推奨）仕事復帰予定"
                ]
              },
              {
                id: "explain_to_customer",
                text: "お客様へ以下の説明をしてください。",
                required: true,
                details: [
                  "（退院時期、療養終了時期が確定している場合）",
                  "・（必須）申出期間は連絡を控える事",
                  "（退院時期、療養終了時期が未定の場合）", 
                  "・（必須）以下３点を説明してください。",
                  " ∟1ヶ月を目途に当社からの連絡を控える事",
                  " ∟1ヶ月の期間経過後は、当社から連絡を差し上げる場合がある事",
                  " ∟退院時期や療養期間等、お客様の状況に変化があった場合は当社まで連絡を頂きたい事"
                ]
              }
            ]
          },
          {
            type: "クロージング",
            items: [
              {
                id: "check_questions",
                text: "不明点の確認",
                required: false
              },
              {
                id: "thank_time",
                text: "時間を頂いた事に対するお礼を述べる",
                required: false
              },
              {
                id: "show_concern",
                text: "体調に対する配慮の意を示す",
                required: false
              },
              {
                id: "introduce_self",
                text: "名乗り",
                required: false
              }
            ]
          }
        ],
        scripts: {
          "クロージング": [
            "ご不明な点、ご質問はございませんか",
            "体調が思わしくない中、お時間を頂きありがとうございました。",
            "お大事になさってください。",
            "私〇〇が承りました。"
          ]
        },
        tips: [
          "入院・療養理由を確認する際は、こちらから病名を確認しない"
        ]
      }
    }
  }
};

// 条件判定関数
export const evaluateConditions = (memberStatus: MemberStatus, conversationData: ConversationData, checkboxStates: { [key: string]: boolean }) => {
  // 基本的な条件判定ロジック
  if (conversationData.hasHospitalization || conversationData.hasMedicalTreatment) {
    return {
      category: "すべて",
      situation: "督促停止", 
      procedure: "督促停止（本人申出／入院・療養）"
    };
  }
  
  if (memberStatus.isDelinquent && conversationData.hasTemporaryPromise) {
    return {
      category: "営業会員（延滞）",
      situation: "一時約束",
      procedure: "一時約束／非延滞A"
    };
  }
  
  return null;
};

// デフォルトの会話データ（テスト用）
export const defaultConversationData: ConversationData = {
  hasTemporaryPromise: true,
  hasHospitalization: false,
  hasMedicalTreatment: false,
  paymentDateExceeds30Days: false,
  balanceOver1Million: false
};