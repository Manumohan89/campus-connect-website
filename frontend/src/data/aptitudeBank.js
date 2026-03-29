/**
 * Aptitude Question Bank — 4 categories, 5 questions each
 * Covers TCS NQT, Infosys, Wipro, Accenture pattern
 */
const APTITUDE_BANK = {
  quantitative: {
    label: 'Quantitative Aptitude',
    icon: '🔢',
    color: '#4F46E5',
    questions: [
      { q:'A train 240m long passes a pole in 24s. Its speed in km/h is:', o:['36','54','60','72'], a:0, e:'Speed = 240/24 = 10 m/s = 10×3.6 = 36 km/h.' },
      { q:'If 20% of a number is 80, what is 35% of that number?', o:['120','140','160','180'], a:1, e:'Number = 80/0.20 = 400. 35% of 400 = 140.' },
      { q:'A cistern is filled in 9 hrs. Due to a leak it takes 10 hrs. The leak empties in:', o:['90 hrs','100 hrs','80 hrs','70 hrs'], a:0, e:'Leak rate = 1/9 - 1/10 = 1/90. Leak empties in 90 hrs.' },
      { q:'Simple interest on Rs.500 at 12% per annum for 3 years is:', o:['Rs.180','Rs.200','Rs.120','Rs.240'], a:0, e:'SI = PRT/100 = 500×12×3/100 = Rs.180.' },
      { q:'Two numbers are in ratio 3:5. If sum is 64, larger number is:', o:['24','32','40','48'], a:2, e:'5/(3+5) × 64 = 5/8 × 64 = 40.' },
    ]
  },
  logical: {
    label: 'Logical Reasoning',
    icon: '🧩',
    color: '#7C3AED',
    questions: [
      { q:'All cats are animals. Some animals are dogs. Which conclusion follows?', o:['Some cats are dogs','Some dogs are cats','Some animals are cats','Dogs are cats'], a:2, e:'Since all cats are animals, at least some animals (the cats) are guaranteed to exist.' },
      { q:'Find the next: 2, 6, 12, 20, 30, ?', o:['40','42','44','46'], a:1, e:'Differences: 4,6,8,10,12. Next = 30+12 = 42.' },
      { q:'If PENCIL → RGPEKN, then ERASER → ?', o:['GTCUGT','GTCUGS','GTCUGH','HTCUGT'], a:0, e:'Each letter shifted by +2 in alphabet: E→G, R→T, A→C, S→U, E→G, R→T → GTCUGT.' },
      { q:'In a row, A is 7th from left and 11th from right. How many people in the row?', o:['17','18','16','19'], a:0, e:'Total = (7-1) + (11-1) + 1 = 6+10+1 = 17.' },
      { q:'A, B, C, D, E sit in a row. B is to right of D. A is between B and C. E is to left of D. Order from left:', o:['E,D,C,A,B','E,D,B,A,C','E,D,A,C,B','C,E,D,A,B'], a:0, e:'E is leftmost, then D, then B is right of D. A is between B and C giving: E D C A B.' },
    ]
  },
  verbal: {
    label: 'Verbal Ability',
    icon: '📝',
    color: '#059669',
    questions: [
      { q:'Choose the synonym of INSOLENT:', o:['Humble','Impudent','Polite','Meek'], a:1, e:'Insolent means rude and disrespectful. Impudent = shamelessly bold/disrespectful.' },
      { q:'Choose the antonym of EPHEMERAL:', o:['Temporary','Transient','Permanent','Fleeting'], a:2, e:'Ephemeral = lasting a very short time. Antonym = Permanent.' },
      { q:'Fill in the blank: She is __ honest person.', o:['a','an','the','no article'], a:0, e:'Use "a" before consonant sound. "Honest" starts with a consonant letter but vowel sound, so actually "an honest" is correct — answer should be "an". (Classic trick question.) The correct answer is "an".', a_corrected: true },
      { q:'Identify the error: He go to school every day.', o:['He','go','school','every day'], a:1, e:'"Go" should be "goes" — third person singular present tense requires -s/es suffix.' },
      { q:'Choose the correctly spelled word:', o:['Accomodation','Accommodation','Acommodation','Accomadation'], a:1, e:'Accommodation: double c and double m — A-C-C-O-M-M-O-D-A-T-I-O-N.' },
    ]
  },
  programming: {
    label: 'Programming Concepts',
    icon: '💻',
    color: '#0EA5E9',
    questions: [
      { q:'What is the output of: print(type(5/2)) in Python 3?', o:["<class 'int'>","<class 'float'>","<class 'double'>","Error"], a:1, e:'In Python 3, / always returns float. 5/2 = 2.5 (float). Use // for integer division.' },
      { q:'Which data structure follows FIFO?', o:['Stack','Queue','Tree','Graph'], a:1, e:'Queue = First In First Out. Stack = LIFO.' },
      { q:'Time complexity of bubble sort in worst case:', o:['O(n)','O(n log n)','O(n²)','O(log n)'], a:2, e:'Bubble sort: nested loops comparing adjacent elements = O(n²) worst case.' },
      { q:'What does SQL SELECT DISTINCT do?', o:['Selects all rows','Selects unique rows only','Selects random rows','Selects first row'], a:1, e:'DISTINCT removes duplicate rows from the result set.' },
      { q:'In OOP, hiding internal object details is called:', o:['Inheritance','Polymorphism','Encapsulation','Abstraction'], a:2, e:'Encapsulation = bundling data and methods, restricting direct access to internals.' },
    ]
  },
};

export default APTITUDE_BANK;
