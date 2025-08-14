import { Customer, Knowledge, MemoSummary, Procedure, ProcedureAssets, TalkScript, TodoItem } from '@/src/presentation/types/callTypes'

export const mockCustomers: Customer[] = [
    {
        customerId: '1',
        name: '山田太郎',
        accountNumber: '7110-00433(6471)',
        paymentDate: '8/25',
        paymentAmount: '25,000円',
        contactHistory: '7月に返答の連絡があり、8月2日に一時約束を取り付け。',
        migrationProbability: 60
    },
    {
        customerId: '2',
        name: '鈴木花子',
        accountNumber: '7110-00434(6472)',
        paymentDate: '8/30',
        paymentAmount: '15,000円',
        contactHistory: '前回支払い遅延、今月は期日厳守を約束。',
        migrationProbability: 30
    }
]

export const mockProcedures: Procedure[] = [
    { procedureId: 'p1', name: '一時約束', category: '返済交渉' },
    { procedureId: 'p2', name: '分割払い相談', category: '返済交渉' },
    { procedureId: 'p3', name: '返済計画変更', category: '返済交渉' },
    { procedureId: 'p4', name: '督促停止依頼', category: '手続き' },
    { procedureId: 'p5', name: '残高確認', category: '照会' }
]

export const mockTodoItems: TodoItem[] = [
    // 通話前TODO
    { todoId: 't1', label: '前回の約束内容を確認', required: true, phase: 'before' },
    { todoId: 't2', label: '顧客の支払い履歴を確認', required: true, phase: 'before' },
    { todoId: 't3', label: '返済可能額の目安を把握', required: false, phase: 'before' },
    { todoId: 't4', label: '交渉材料の準備', required: false, phase: 'before' },

    // 通話中TODO（手続き別）
    { todoId: 't5', label: '本人確認の上でプロミスだと名乗る', required: true, phase: 'during', procedureId: 'p1' },
    { todoId: 't6', label: '今回の電話の要件を伝える', required: true, phase: 'during', procedureId: 'p1' },
    { todoId: 't7', label: '事情について詳細確認', required: false, phase: 'during', procedureId: 'p1' },
    { todoId: 't8', label: 'お客さまと返済期日・金額を交渉する', required: true, phase: 'during', procedureId: 'p1' },
    { todoId: 't9', label: '支払い方法を確認する', required: false, phase: 'during', procedureId: 'p1' },
    { todoId: 't10', label: '手数料を案内する', required: false, phase: 'during', procedureId: 'p1' },
    { todoId: 't11', label: '次回の期日・支払額を確認する', required: true, phase: 'during', procedureId: 'p1' },
    { todoId: 't12', label: '次回期日までは督促が停止されることを案内する', required: false, phase: 'during', procedureId: 'p1' },
    { todoId: 't13', label: 'お客さまからの質問がないかを確認する', required: false, phase: 'during', procedureId: 'p1' },

    // 通話後TODO
    { todoId: 't14', label: '交渉結果をシステムに入力', required: true, phase: 'after' },
    { todoId: 't15', label: '次回アクション日を設定', required: true, phase: 'after' },
    { todoId: 't16', label: '上長への報告が必要な場合は報告', required: false, phase: 'after' },
    { todoId: 't17', label: '特記事項をメモに記載', required: false, phase: 'after' }
]

export const mockTalkScripts: TalkScript[] = [
    {
        scriptId: 's1',
        procedureId: 'p1',
        title: '本人確認',
        content: '〇〇さまのお電話でまちがいないでしょうか。\nご本人さまであれば、生年月日を教えていただけますでしょうか？\n確認がとれましたら、私、プロミスの◯◯と申します。',
        required: true
    },
    {
        scriptId: 's2',
        procedureId: 'p1',
        title: '要件説明',
        content: '支払いの遅延について状況をお伺いできればと思い、ご連絡いたしました。',
        required: true
    },
    {
        scriptId: 's3',
        procedureId: 'p1',
        title: '事情確認',
        content: '差し支えなければ、どういったご事情があって難しかったかお聞かせいただけますか？',
        required: false
    },
    {
        scriptId: 's4',
        procedureId: 'p1',
        title: '交渉提案',
        content: 'それでは、以下の候補をご確認いただけますか？',
        required: true
    },
    {
        scriptId: 's5',
        procedureId: 'p1',
        title: '支払い方法確認',
        content: '現在の方法（ATM/銀行振込など）をご希望ですか？',
        required: false
    },
    {
        scriptId: 's6',
        procedureId: 'p1',
        title: '手数料案内',
        content: '支払ATMでの取扱手数料が発生します。手数料は返済金額とは別にお客さまの負担になります。',
        required: false
    },
    {
        scriptId: 's7',
        procedureId: 'p1',
        title: '確認',
        content: 'それでは、○○○○年○月○日までに、提携ATMでのお支払いということで承りました。',
        required: true
    },
    {
        scriptId: 's8',
        procedureId: 'p1',
        title: '督促停止案内',
        content: 'このお電話をもって、今後は次の期日までお客様に個別のご連絡は行わないように進めますので、ご了承ください。',
        required: false
    },
    {
        scriptId: 's9',
        procedureId: 'p1',
        title: '最終確認',
        content: '私からのご案内は以上となりますが、最後にお客さまから気になることなどございますか？',
        required: false
    }
]

export const mockKnowledge: Knowledge[] = [
    {
        knowledgeId: 'k1',
        procedureId: 'p1',
        title: '本人確認の注意事項',
        content: '事業主宛/父母等はNG。氏名、生年月日、電話番号いずれかの確認が必要。',
        tags: ['本人確認', '必須']
    },
    {
        knowledgeId: 'k2',
        procedureId: 'p1',
        title: '支払い交渉の注意',
        content: '「支払いが難しい＝滞納」とは言わない。理由のヒアリングに注力する。',
        tags: ['交渉', '注意']
    },
    {
        knowledgeId: 'k3',
        procedureId: 'p1',
        title: '移管確率による対応',
        content: 'お客さまは移管確率60%のため、返済行動率を高めるために事実と今後の収支見込みを確認する。',
        tags: ['移管確率', '対応方針']
    },
    {
        knowledgeId: 'k4',
        procedureId: 'p1',
        title: '交渉の原則',
        content: 'まずは本日から近い日付、約定日に近い日程で交渉する。',
        tags: ['交渉', 'ベストプラクティス']
    }
]

export const mockMemoSummaries: MemoSummary[] = [
    {
        customerId: '1',
        summaryText: '前回交渉：7月に支払い意思確認。8月2日に一時約束を取り付けたが未履行。収入減少による支払い困難を訴えている。分割払いを希望しているが、まずは少額でも入金を促す必要あり。',
        lastUpdated: new Date('2024-08-10')
    },
    {
        customerId: '2',
        summaryText: '優良顧客。過去の遅延は1回のみ。今回は家族の医療費による一時的な資金不足。返済意欲は高く、具体的な返済計画を提示済み。',
        lastUpdated: new Date('2024-08-11')
    }
]

export const mockProcedureAssets: ProcedureAssets[] = [
    {
        procedureId: 'p1',
        todoItems: mockTodoItems.filter(t => t.procedureId === 'p1'),
        talkScripts: mockTalkScripts.filter(s => s.procedureId === 'p1'),
        knowledgeSnippets: mockKnowledge.filter(k => k.procedureId === 'p1')
    },
    {
        procedureId: 'p2',
        todoItems: [],
        talkScripts: [],
        knowledgeSnippets: []
    }
]

export const mockPaymentProposals = [
    { date: '2025年8月15日', amount: '¥12,000', note: '' },
    { date: '2025年8月25日', amount: '¥9,000', note: '' },
    { date: '2025年8月31日', amount: '¥3,000', note: '（利息のみ）' }
]