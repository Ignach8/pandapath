import type { Ex, L, LessonDef, LessonKind, Opt, Sentence, Unit, Word } from "./types";

const EN = "en-US" as const;

const mc = (stem: string, opts: string[], ans: number, why?: string, extra: Partial<Extract<Ex, { t: "mc" }>> = {}): Ex => ({
  t: "mc",
  stem,
  opts: opts.map((label): Opt => ({ label })),
  ans,
  why,
  ...extra,
});

const lesson = (id: string, kind: LessonKind, title: L, ex?: Ex[]): LessonDef => ({ id, kind, title, ex });

const ve = (id: string, ipa: string, en: string, es: string, zh: string): Word => ({ id, h: id, p: ipa, m: { en, es, zh }, level: 0 });

const VOCAB_1: Word[] = [
  ve("analyze", "/ˈænəlaɪz/", "to examine something carefully in order to understand it", "analizar; examinar con detalle", "分析"),
  ve("approach", "/əˈproʊtʃ/", "a way of dealing with a problem or task", "enfoque; manera de abordar algo", "方法；途径"),
  ve("assume", "/əˈsuːm/", "to accept something as true without proof", "suponer; dar algo por cierto", "假设；假定"),
  ve("concept", "/ˈkɑːnsɛpt/", "an abstract idea", "concepto; idea abstracta", "概念"),
  ve("evidence", "/ˈɛvɪdəns/", "facts or signs that show something is true", "evidencia; pruebas", "证据"),
  ve("factor", "/ˈfæktər/", "one of the things that influence a result", "factor; elemento que influye", "因素"),
  ve("significant", "/sɪɡˈnɪfɪkənt/", "important or large enough to matter", "significativo; importante", "重要的；显著的"),
  ve("sustain", "/səˈsteɪn/", "to keep something going over time", "mantener; sostener", "维持；支撑"),
];

const VOCAB_2: Word[] = [
  ve("derive", "/dɪˈraɪv/", "to obtain something from a source", "derivar; obtener de", "获得；源自"),
  ve("estimate", "/ˈɛstɪmeɪt/", "to calculate roughly", "estimar; calcular de forma aproximada", "估计；估算"),
  ve("indicate", "/ˈɪndɪkeɪt/", "to show or point out", "indicar; señalar", "表明；指出"),
  ve("interpret", "/ɪnˈtɜːrprɪt/", "to explain the meaning of something", "interpretar; explicar el significado", "解释；诠释"),
  ve("maintain", "/meɪnˈteɪn/", "to keep in good condition or continue", "mantener; conservar", "维持；保养"),
  ve("require", "/rɪˈkwaɪər/", "to need or demand", "requerir; exigir", "需要；要求"),
  ve("structure", "/ˈstrʌktʃər/", "the way parts are arranged", "estructura; organización", "结构"),
  ve("variable", "/ˈvɛriəbəl/", "a factor that can change in an experiment", "variable; factor que puede cambiar", "变量"),
];

const cloze = (word: string, before: string, after: string): Sentence => ({ h: `${before}___${after}`, p: "", m: { en: word } });

const SENT_1: Sentence[] = [
  cloze("analyze", "Scientists ", " the data to find patterns."),
  cloze("approach", "The team took a new ", " to the problem."),
  cloze("assume", "Don't ", " the answer is correct without checking."),
  cloze("concept", "Gravity is a difficult ", " for young children."),
  cloze("evidence", "There is strong ", " that exercise improves memory."),
  cloze("factor", "Cost was the main ", " in her decision."),
  cloze("significant", "The study found a ", " increase in sales."),
  cloze("sustain", "It is hard to ", " interest in a very long lecture."),
];

const SENT_2: Sentence[] = [
  cloze("derive", "Many English words ", " from Latin roots."),
  cloze("estimate", "Engineers ", " that the bridge will take two years to build."),
  cloze("indicate", "The results ", " that the new method works."),
  cloze("interpret", "Historians ", " old documents to understand the past."),
  cloze("maintain", "Regular exercise helps you ", " a healthy weight."),
  cloze("require", "The course will ", " weekly lab reports."),
  cloze("structure", "The ", " of the essay was clear and logical."),
  cloze("variable", "Temperature was the only ", " in the experiment."),
];

const completeWords: Ex[] = [
  { t: "type", stem: "Complete the word", before: "The lib", after: " closes at nine tonight.", ans: ["rary"] },
  { t: "type", stem: "Complete the word", before: "Please sub", after: " your assignment by Friday.", ans: ["mit"] },
  { t: "type", stem: "Complete the word", before: "Many stud", after: " work part-time near campus.", ans: ["ents"] },
  { t: "type", stem: "Complete the word", before: "The exper", after: " produced surprising results.", ans: ["iment"] },
  { t: "type", stem: "Complete the word", before: "Rainfall can af", after: " how quickly crops grow.", ans: ["fect"] },
  { t: "type", stem: "Complete the word", before: "She wants to impr", after: " her writing skills.", ans: ["ove"] },
];

const NOTICE = `Riverside Community Center — Free evening classes start Monday, March 3. Choose from beginner cooking, digital photography, or English conversation practice. Classes meet twice a week for six weeks. Registration is open at the front desk until Friday at 5 p.m. A materials fee of $15 is required for cooking and photography. Bring a valid ID when you register. Parking is free behind the building after 6 p.m.`;

const EMAIL = `From: Maya Torres\nTo: Prof. Allen\nSubject: Missing Thursday's lab\n\nDear Professor Allen,\nI'm writing to let you know that I will miss Thursday's lab because I have a dental appointment that I could not reschedule. I have already read the experiment instructions and can complete the data analysis at home. Could I come to your office hours on Friday to collect the lab sheet and ask a few questions?\nThank you for your understanding.\nBest regards,\nMaya`;

const BEES = `Honeybees communicate the location of food through a movement known as the waggle dance. When a forager finds a rich source of nectar, she returns to the hive and moves in a figure-eight pattern on the honeycomb. The angle of the straight middle section shows the direction of the food relative to the sun, while the length of that section shows the distance. Other bees follow the dancer closely, touching her with their antennae to learn the information. Researchers once doubted that insects could share such detailed messages, but experiments in which scientists moved feeding stations confirmed that nestmates arrived at the correct places.`;

const HEAT = `Cities are often several degrees warmer than the surrounding countryside, a phenomenon called the urban heat island effect. Dark surfaces such as asphalt and roofs absorb sunlight and release it slowly as heat after sunset. In addition, buildings block wind, and the lack of vegetation reduces the cooling that normally occurs when plants release water vapor. Planners have responded in several ways. Some cities paint roofs white, others plant trees along streets, and a few are building green roofs covered with soil and plants. Although these measures cost money, studies suggest that they lower energy use for air conditioning, which can offset the expense over time.`;

const CONVO = `Student: Hi, I'm here about a parking permit. Staff: Sure. Are you a commuter, or do you live on campus? Student: I commute from about twenty minutes away. Staff: Then you'll need the Zone B permit. It costs one hundred twenty dollars for the semester, and you can pay online. Student: Can I get it today? Staff: The system updates overnight, so you can pick it up tomorrow morning.`;

const ANNOUNCE = `Attention, passengers on the university shuttle. Due to construction on Maple Street, the Route 4 shuttle will use Fifth Avenue until further notice. Please allow an extra ten minutes of travel time. The stop in front of the science building will be temporarily closed. Students can board at the new stop beside the bookstore instead.`;

const TALK = `Today I'd like to talk about camouflage in animals. Many species avoid predators by blending into their surroundings. The stick insect, for example, looks almost exactly like a twig. But camouflage isn't only about color. The cuttlefish can change both the color and the texture of its skin within a second, matching sand, rock, or seaweed. Scientists believe this ability is controlled directly by the animal's nervous system, not by hormones, which would act too slowly.`;

const sayHidden = (text: string) => ({ text, lang: EN, hideText: true, auto: true });

const respond = (prompt: string, right: string, wrong: string[]): Ex => {
  const opts = [right, ...wrong];
  return {
    t: "mc",
    stem: "Choose the best response.",
    say: sayHidden(prompt),
    opts: opts.map((label) => ({ label })),
    ans: 0,
    why: `"${prompt}" → "${right}"`,
  };
};

const buildSentence = (context: string, words: string[], extra: string[], sentence: string): Ex => ({
  t: "bank",
  stem: context,
  tokens: [...words, ...extra],
  ans: words,
  join: " ",
  lang: EN,
  hint: sentence,
});

const BUILD: Ex[] = [
  buildSentence("Where did you park?", ["I", "parked", "behind", "the", "library"], ["front"], "I parked behind the library"),
  buildSentence("What did the professor say?", ["She", "said", "the", "exam", "is", "on", "Friday"], ["was"], "She said the exam is on Friday"),
  buildSentence("Why were you late?", ["My", "bus", "was", "delayed", "by", "the", "snow"], ["were"], "My bus was delayed by the snow"),
  buildSentence("Can you help me with the assignment?", ["Of", "course", "I", "can", "help", "you", "after", "class"], ["before"], "Of course I can help you after class"),
  buildSentence("What are you studying this term?", ["I", "am", "studying", "environmental", "science"], ["study"], "I am studying environmental science"),
  buildSentence("Do you know where the lab is?", ["I", "think", "it", "is", "on", "the", "second", "floor"], ["in"], "I think it is on the second floor"),
];

const REPEAT: Ex[] = [
  "The library will be open until midnight during exam week.",
  "Please submit your assignment before the deadline.",
  "I would like to schedule an appointment with my advisor.",
  "The experiment showed that temperature affects growth.",
  "Students can borrow up to ten books at a time.",
  "She decided to take a different approach to the problem.",
].map((text): Ex => ({ t: "speak", text, lang: EN }));

const INTERVIEW: Ex[] = [
  {
    t: "essay",
    kind: "interview",
    stem: "Tell me about a place in your hometown that you enjoy visiting. Why do you like it?",
    minWords: 25,
    voice: true,
    checks: [
      { label: "Names a specific place", re: "\\b(park|beach|market|library|cafe|café|museum|river|mountain|square|plaza|garden)\\b" },
      { label: "Gives a reason", re: "\\b(because|since|so that|the reason)\\b" },
      { label: "Adds a detail or example", re: "\\b(for example|for instance|such as|when i)\\b" },
    ],
    model: "There is a small park near my house that I visit every weekend. I like it because it is quiet and full of trees, so I can relax after a busy week. For example, last Sunday I read a book there for two hours.",
  },
  {
    t: "essay",
    kind: "interview",
    stem: "Do you prefer studying alone or with a group? Explain your choice.",
    minWords: 25,
    voice: true,
    checks: [
      { label: "States a preference", re: "\\b(i prefer|i like|i usually|i would rather)\\b" },
      { label: "Gives a reason", re: "\\b(because|since|the reason)\\b" },
      { label: "Contrasts with the other option", re: "\\b(however|but|although|while|on the other hand)\\b" },
    ],
    model: "I prefer studying alone because I can concentrate better and move at my own speed. However, I sometimes join a group before an exam, since explaining ideas to friends helps me remember them.",
  },
  {
    t: "essay",
    kind: "interview",
    stem: "Describe a skill you would like to learn and explain why.",
    minWords: 25,
    voice: true,
    checks: [
      { label: "Names a skill", re: "\\b(learn|skill|play|speak|cook|code|program|draw|swim|dance)\\b" },
      { label: "Gives a reason", re: "\\b(because|since|so that|in order to)\\b" },
      { label: "Mentions a plan", re: "\\b(will|going to|plan|hope|would)\\b" },
    ],
    model: "I would like to learn to play the guitar because music helps me relax. I plan to practice twenty minutes every day and take online lessons, so that I can play a few songs by the end of the year.",
  },
];

const EMAIL_TASK: Ex = {
  t: "essay",
  kind: "email",
  stem: "Your professor posted a reading list that is too long to finish before the exam. Write an email to your professor. Explain the problem and ask for a suggestion.",
  context: "Write at least 50 words. Use a greeting, a clear request and a polite closing.",
  minWords: 50,
  checks: [
    { label: "Greeting (Dear / Hello)", re: "^\\s*(dear|hello|hi)\\b" },
    { label: "Explains the problem", re: "\\b(too long|not enough time|cannot finish|can't finish|difficult|worried|problem)\\b" },
    { label: "Polite request (could / would / may)", re: "\\b(could|would|may|can)\\b[^.?!]*\\?" },
    { label: "Closing (Sincerely / Best regards / Thank you)", re: "(sincerely|best regards|regards|thank you|thanks)" },
  ],
  model:
    "Dear Professor Lee,\nI am writing about the reading list for the final exam. I am worried that it is too long for me to finish in the time that remains, because I also have two other exams that week. Could you please tell me which readings are the most important, or suggest a way to prioritize them?\nThank you very much for your help.\nSincerely,\nAna Silva",
};

const DISCUSSION_TASK: Ex = {
  t: "essay",
  kind: "discussion",
  stem: "Professor: Should universities require every student to take at least one foreign language course?",
  context:
    "Student A: Yes. Languages build thinking skills and open job opportunities.\nStudent B: No. Required courses add stress. Students should choose what to study.\n\nAdd your own contribution to the discussion (at least 60 words).",
  minWords: 60,
  checks: [
    { label: "Clear opinion (I think / I believe / In my opinion)", re: "\\b(i (think|believe|agree|disagree)|in my opinion|my view)\\b" },
    { label: "Reason or example (because / for example)", re: "\\b(because|since|for example|for instance)\\b" },
    { label: "Responds to another view (however / although / while)", re: "\\b(however|although|while|on the other hand|but)\\b" },
  ],
  model:
    "I believe universities should require one foreign language course. Although Student B is right that required classes can be stressful, learning a language also teaches students to communicate with people from different cultures. For example, many employers value graduates who can work in international teams. Universities could reduce stress by offering several levels and flexible schedules.",
};

const u = (
  n: number,
  skill: Unit["skill"],
  icon: string,
  title: L,
  sub: string,
  lessons: LessonDef[],
  extra: Partial<Unit> = {},
): Unit => ({
  id: `toefl-u${n}`,
  courseId: "toefl",
  index: n - 1,
  icon,
  title,
  subtitle: sub,
  colorIdx: (n - 1) % 5,
  words: [],
  sentences: [],
  guide: [],
  lessons,
  skill,
  ...extra,
});

let cached: Unit[] | null = null;

export const getToeflUnits = (): Unit[] => {
  if (cached) return cached;
  const vocabLessons = (n: number): LessonDef[] => [
    lesson(`toefl-u${n}-learn`, "learn", { en: "New words", es: "Palabras nuevas", zh: "新单词" }),
    lesson(`toefl-u${n}-listen`, "listen", { en: "Listen", es: "Escucha", zh: "听力" }),
    lesson(`toefl-u${n}-test`, "test", { en: "Review", es: "Repaso", zh: "复习" }),
  ];

  cached = [
    u(1, "vocab", "📚", { es: "Vocabulario académico 1", en: "Academic vocabulary 1", zh: "学术词汇 1" }, "analyze · approach · assume", vocabLessons(1), {
      words: VOCAB_1,
      sentences: SENT_1,
      guide: [
        {
          title: { es: "Palabras que se repiten en el TOEFL", en: "Words that keep showing up in the TOEFL", zh: "托福高频学术词" },
          body: {
            es: "Estas palabras aparecen en lecturas, charlas y preguntas de escritura. Aprende cada una con su colocación: analyze data, a significant increase, strong evidence.",
            en: "These words appear in readings, lectures and writing prompts. Learn each with its collocation: analyze data, a significant increase, strong evidence.",
            zh: "这些词常出现在阅读、听力和写作题中。请连同搭配一起记：analyze data、a significant increase、strong evidence。",
          },
        },
      ],
    }),
    u(2, "reading", "📖", { es: "Lectura: palabras y vida diaria", en: "Reading: words & daily life", zh: "阅读：补全单词与日常文本" }, "Complete the Words · Read in Daily Life", [
      lesson("toefl-u2-l1", "reading", { en: "Complete the Words", es: "Completar palabras", zh: "补全单词" }, completeWords),
      lesson("toefl-u2-l2", "reading", { en: "Read in Daily Life: notice", es: "Leer en la vida diaria: aviso", zh: "日常阅读：通知" }, [
        mc("What is the main purpose of the notice?", ["To announce new parking rules", "To advertise free evening classes", "To ask for volunteers", "To report a schedule change"], 1, "The notice opens by announcing free evening classes.", { passage: { title: "Notice", text: NOTICE } }),
        mc("What must people do to register?", ["Call the center on Friday", "Pay $15 online", "Go to the front desk and bring ID", "Attend the first class"], 2, "Registration is at the front desk, and a valid ID is required.", { passage: { title: "Notice", text: NOTICE } }),
        mc("Which class does NOT require a materials fee?", ["Beginner cooking", "Digital photography", "English conversation practice", "All of them"], 2, "The $15 fee applies only to cooking and photography.", { passage: { title: "Notice", text: NOTICE } }),
      ]),
      lesson("toefl-u2-l3", "reading", { en: "Read in Daily Life: email", es: "Leer en la vida diaria: correo", zh: "日常阅读：电子邮件" }, [
        mc("Why is Maya writing to the professor?", ["To complain about the lab", "To explain an absence and ask for help", "To change her major", "To ask for a longer deadline"], 1, "She will miss the lab and wants to collect the lab sheet.", { passage: { title: "Email", text: EMAIL } }),
        mc("What does Maya suggest?", ["Doing the lab on Saturday", "Visiting office hours on Friday", "Sending a friend", "Skipping the data analysis"], 1, "She asks to come to office hours on Friday.", { passage: { title: "Email", text: EMAIL } }),
      ]),
    ]),
    u(3, "listening", "🎧", { es: "Escucha: respuestas y conversación", en: "Listening: responses & conversation", zh: "听力：应答与对话" }, "Listen and Choose a Response · Listen to a Conversation", [
      lesson("toefl-u3-l1", "listening", { en: "Listen and Choose a Response", es: "Escuchar y elegir una respuesta", zh: "听后选择应答" }, [
        respond("Excuse me, do you know when the next shuttle to campus leaves?", "It leaves in about ten minutes.", ["I walked to campus yesterday.", "The shuttle is very comfortable.", "Yes, I know the driver."]),
        respond("I can't believe the library is closing early today.", "Me neither. Should we study at the café instead?", ["I borrowed three books.", "It is on the second floor.", "Yes, it opens at nine."]),
        respond("Would you mind if I opened the window?", "Not at all, it's a bit warm in here.", ["I opened it yesterday.", "The window is new.", "Yes, I would like some water."]),
        respond("How did your presentation go?", "Better than I expected, thanks.", ["I presented it on a screen.", "It is about biology.", "At two o'clock."]),
        respond("Have you finished the lab report yet?", "Almost. I just need to write the conclusion.", ["The lab is closed on Sunday.", "I reported it to the office.", "No, I don't like labs."]),
      ]),
      lesson("toefl-u3-l2", "listening", { en: "Listen to a Conversation", es: "Escuchar una conversación", zh: "听对话" }, [
        mc("Why does the student visit the office?", ["To pay a fine", "To get a parking permit", "To change dorms", "To ask about a bus route"], 1, "He says he is there about a parking permit.", { say: sayHidden(CONVO) }),
        mc("What is true about the Zone B permit?", ["It is free for commuters", "It costs $120 per semester", "It is only for dorm residents", "It must be paid in person"], 1, "Zone B costs one hundred twenty dollars for the semester, payable online.", { say: sayHidden(CONVO) }),
        mc("When can the student pick up the permit?", ["Today", "Tomorrow morning", "Next week", "After the semester"], 1, "The system updates overnight.", { say: sayHidden(CONVO) }),
      ]),
    ]),
    u(4, "writing", "✍️", { es: "Escritura: oraciones y correo", en: "Writing: sentences & email", zh: "写作：造句与邮件" }, "Build a Sentence · Write an Email", [
      lesson("toefl-u4-l1", "writing", { en: "Build a Sentence", es: "Armar una oración", zh: "组句" }, BUILD),
      lesson("toefl-u4-l2", "writing", { en: "Write an Email", es: "Escribir un correo", zh: "写电子邮件" }, [EMAIL_TASK]),
    ]),
    u(5, "speaking", "🗣️", { es: "Habla: repetir y entrevista", en: "Speaking: repeat & interview", zh: "口语：跟读与面试" }, "Listen and Repeat · Take an Interview", [
      lesson("toefl-u5-l1", "speaking", { en: "Listen and Repeat", es: "Escuchar y repetir", zh: "听后复述" }, REPEAT),
      lesson("toefl-u5-l2", "speaking", { en: "Take an Interview", es: "Hacer una entrevista", zh: "面试" }, INTERVIEW),
    ]),
    u(6, "reading", "🔬", { es: "Lectura académica", en: "Academic reading", zh: "学术阅读" }, "Read an Academic Passage", [
      lesson("toefl-u6-l1", "reading", { en: "The waggle dance", es: "La danza de las abejas", zh: "蜜蜂的摇摆舞" }, [
        mc("What does the length of the straight section of the dance indicate?", ["The type of flower", "The distance to the food", "The number of bees needed", "The time of day"], 1, "The passage says the length of that section shows the distance.", { passage: { title: "Honeybees", text: BEES } }),
        mc('The word "forager" in the passage is closest in meaning to a bee that', ["builds the honeycomb", "searches for food", "guards the hive", "produces honey"], 1, "A forager finds nectar and returns to the hive.", { passage: { title: "Honeybees", text: BEES } }),
        mc("What can be inferred from the experiments with feeding stations?", ["Bees prefer moving food", "The dance passes on accurate information", "Bees ignore the sun", "Only some bees can dance"], 1, "Nestmates arrived at the correct places after the stations were moved.", { passage: { title: "Honeybees", text: BEES } }),
      ]),
      lesson("toefl-u6-l2", "reading", { en: "Urban heat islands", es: "Islas de calor urbanas", zh: "城市热岛" }, [
        mc("What is the main idea of the passage?", ["Trees are expensive to plant", "Cities are warmer than nearby rural areas for several reasons, and planners can reduce the effect", "Air conditioning should be banned", "Wind always cools cities"], 1, "The passage explains causes and then solutions.", { passage: { title: "Urban heat", text: HEAT } }),
        mc("Why do asphalt surfaces make cities hotter?", ["They block the wind", "They absorb sunlight and release heat slowly", "They reduce plant growth", "They reflect sunlight"], 1, "They absorb sunlight and release it as heat after sunset.", { passage: { title: "Urban heat", text: HEAT } }),
        mc('The word "offset" in the passage is closest in meaning to', ["increase", "balance out", "delay", "measure"], 1, "Savings in energy can balance out the cost.", { passage: { title: "Urban heat", text: HEAT } }),
      ]),
    ]),
    u(7, "listening", "📢", { es: "Escucha: anuncio y charla", en: "Listening: announcement & talk", zh: "听力：通知与讲座" }, "Listen to an Announcement · Listen to an Academic Talk", [
      lesson("toefl-u7-l1", "listening", { en: "Announcement", es: "Anuncio", zh: "通知" }, [
        mc("What is the announcement mainly about?", ["A new shuttle fare", "A change in the shuttle route", "A bookstore sale", "A road race"], 1, "Route 4 will use Fifth Avenue because of construction.", { say: sayHidden(ANNOUNCE) }),
        mc("Where should students board instead of the science building stop?", ["In front of the library", "Beside the bookstore", "On Maple Street", "At the main gate"], 1, "The new stop is beside the bookstore.", { say: sayHidden(ANNOUNCE) }),
      ]),
      lesson("toefl-u7-l2", "listening", { en: "Academic talk", es: "Charla académica", zh: "学术讲座" }, [
        mc("What is the talk mainly about?", ["How animals use camouflage", "How insects communicate", "Why animals migrate", "How skin heals"], 0, "The speaker introduces camouflage in animals.", { say: sayHidden(TALK) }),
        mc("Why does the professor mention the stick insect?", ["To show an animal that resembles its surroundings", "To explain a hormone", "To compare it with the cuttlefish's speed", "To describe an endangered species"], 0, "It looks almost exactly like a twig.", { say: sayHidden(TALK) }),
        mc("Why do scientists think the cuttlefish's skin changes are controlled by the nervous system?", ["Hormones would work too slowly", "The skin has no color", "Cuttlefish cannot sense light", "It happens only at night"], 0, "The change happens within a second, too fast for hormones.", { say: sayHidden(TALK) }),
      ]),
    ]),
    u(8, "writing", "💬", { es: "Escritura: discusión académica", en: "Writing: academic discussion", zh: "写作：学术讨论" }, "Write for an Academic Discussion", [
      lesson("toefl-u8-l1", "writing", { en: "Academic discussion", es: "Discusión académica", zh: "学术讨论" }, [DISCUSSION_TASK]),
    ]),
    u(9, "vocab", "🧠", { es: "Vocabulario académico 2", en: "Academic vocabulary 2", zh: "学术词汇 2" }, "derive · estimate · indicate", vocabLessons(9), {
      words: VOCAB_2,
      sentences: SENT_2,
      guide: [
        {
          title: { es: "Verbos académicos", en: "Academic verbs", zh: "学术动词" },
          body: {
            es: "Verbos como indicate, estimate o interpret son típicos de lecturas científicas. Practica con la estructura: The results indicate that…",
            en: "Verbs such as indicate, estimate or interpret are typical of scientific readings. Practice the pattern: The results indicate that…",
            zh: "indicate、estimate、interpret 等动词常见于科学类文章。常用句型：The results indicate that…",
          },
        },
      ],
    }),
    u(10, "speaking", "🎤", { es: "Habla: simulacro", en: "Speaking: mock round", zh: "口语：模拟练习" }, "Listen and Repeat · Take an Interview", [
      lesson("toefl-u10-l1", "speaking", { en: "Listen and Repeat", es: "Escuchar y repetir", zh: "听后复述" }, REPEAT.slice().reverse()),
      lesson("toefl-u10-l2", "speaking", { en: "Take an Interview", es: "Hacer una entrevista", zh: "面试" }, INTERVIEW.slice().reverse()),
    ]),
  ];
  return cached;
};
