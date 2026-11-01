// General English practice plans, not tied to a particular school textbook.
const make=(rows)=>rows.map(([title,word,meaning,example,script,question,options,correct])=>({title,word:[word,meaning,example],script,question,options,correct}));
export const childPlans={
grade1:make([
['Say hello','hello','xin chào','Hello, Mum!','Hello! My name is Lily. Hello, Ben!','What do we say when we meet?',['Hello','Good night','Goodbye'],0],
['Count with me','one','một','I have one ball.','I have one ball. One ball!','How many balls?',['Two','One','Three'],1],
['Find a colour','red','màu đỏ','The ball is red.','Look! The ball is red. The bag is blue.','What colour is the ball?',['Blue','Green','Red'],2],
['My family','mum','mẹ','This is my mum.','This is my mum. Hello, Mum!','Who is this?',['Mum','A cat','A teacher'],0],
['Little animals','cat','con mèo','It is a cat.','I see a cat. The cat says meow.','Which animal says meow?',['A dog','A cat','A bird'],1],
['In my school bag','book','quyển sách','This is my book.','I have a book. It is in my bag.','What is in the bag?',['A ball','An apple','A book'],2],
['Listen and show','hand','bàn tay','This is my hand.','Show me your hand. Wave your hand!','What do we wave?',['A hand','A foot','A nose'],0],
['Yummy fruit','apple','quả táo','I like an apple.','I have an apple. The apple is red.','What fruit is red?',['A banana','An apple','A pear'],1],
['Time to play','ball','quả bóng','I have a ball.','Look at my ball. Let us play!','What do we play with?',['A book','A cup','A ball'],2],
['Look at shapes','circle','hình tròn','It is a circle.','Look at this shape. It is a circle. It is round.','Which shape is round?',['A circle','A square','A triangle'],0],
['Move and say','jump','nhảy','I can jump.','I can jump. Jump, jump, jump!','What can I do?',['Swim','Jump','Sleep'],1],
['Look outside','sunny','có nắng','It is sunny.','Look outside. It is sunny. Let us play!','What is the weather like?',['Rainy','Snowy','Sunny'],2],
['How do you feel?','happy','vui vẻ','I am happy.','I am happy. I smile and play.','How do I feel?',['Happy','Sad','Angry'],0],
['My little word party','friend','bạn','You are my friend.','Hello, my friend! We play with a red ball.','What colour is the ball?',['Blue','Red','Yellow'],1]
]),
grade5:make([
['Introduce yourself','introduce','giới thiệu','I can introduce myself.','Hello! I am Mia. I am in Class Five. I like drawing and learning about animals.','What does Mia like?',['Drawing and animals','Football and music','Cooking and swimming'],0],
['People in my family','family','gia đình','My family helps me.','There are four people in my family. On Sundays, we cook lunch together and visit my grandparents.','What does the family do on Sundays?',['Go to school','Cook and visit grandparents','Play tennis'],1],
['My school day','subject','môn học','My favourite subject is English.','My favourite subject is science because I enjoy experiments. We have science on Tuesday and Friday.','Why does the speaker like science?',['It is easy','There is no homework','They enjoy experiments'],2],
['Hobbies after school','hobby','sở thích','My hobby is drawing.','After school, Linh draws pictures. Her brother plays badminton. They both read before bed.','What does Linh do after school?',['Draws pictures','Plays badminton','Watches a film'],0],
['Food for a busy day','breakfast','bữa sáng','I eat breakfast before school.','For breakfast, I eat eggs and bread. I drink water. A good breakfast helps me get ready for school.','What does the speaker drink?',['Milk','Water','Juice'],1],
['Around my neighbourhood','between','ở giữa','The library is between two shops.','The library is between a bakery and a bookshop. It is opposite the park. I go there to read.','Where is the library?',['Inside the park','Next to the school','Between two shops'],2],
['My first week in words','weekend','cuối tuần','I read at the weekend.','At the weekend, I read a story about a dolphin. Then I drew a picture of the dolphin with my sister.','What was the story about?',['A dolphin','A cat','A bird'],0],
['Plans for tomorrow','tomorrow','ngày mai','I will play tomorrow.','Tomorrow, our class will visit a museum. We will take notebooks to write about what we see.','What will the class take?',['Toys','Notebooks','Bicycles'],1],
['Working as a team','together','cùng nhau','We learn together.','Our group is making a poster. An writes the words, Bao draws the pictures and I check the spelling.','Who checks the spelling?',['An','Bao','The speaker'],2],
['Describe a place','describe','miêu tả','I can describe my room.','My room is small and bright. A desk is beside the window, and my books are on a shelf above it.','Where is the desk?',['Beside the window','Under the bed','Behind the door'],0],
['Compare and choose','taller','cao hơn','The tree is taller than me.','The blue backpack is larger than the red one, but the red one is lighter. I choose the red one for walking.','Why choose the red backpack?',['It is larger','It is lighter','It is blue'],1],
['Invite a friend','invitation','lời mời','Thank you for the invitation.','Would you like to come to my birthday picnic? It is on Saturday at three in the park. Please bring a hat.','What should the friend bring?',['A cake','A notebook','A hat'],2],
['Care for our world','recycle','tái chế','We recycle paper at school.','Our class wants to reduce waste. We use both sides of our paper and bring reusable water bottles.','How does the class save paper?',['Uses both sides','Throws it away','Buys more notebooks'],0],
['Look at my progress','progress','sự tiến bộ','I can see my progress.','This week I practised giving invitations and describing places. Next week I want to tell a longer story about my family.','What is the next goal?',['Learn to swim','Tell a longer story','Buy a bag'],1]
])};
export const grade5Grammar=[
['My name ___ Mia.',['am','is','are'],1,'Use “is” with “my name”.'],
['There ___ four people in my family.',['are','is','am'],0,'Use “are” with more than one person.'],
['I like science ___ I enjoy experiments.',['but','or','because'],2,'“Because” introduces a reason.'],
['Linh enjoys ___ pictures.',['draw','drawing','drew'],1,'Use an -ing form after “enjoy”.'],
['I eat breakfast ___ school.',['before','between','under'],0,'“Before school” means earlier than the start of school.'],
['The library is ___ two shops.',['on','at','between'],2,'Use “between” for a place with something on each side.'],
['Yesterday, I ___ a story.',['reads','read','reading'],1,'The past form of “read” is spelled “read”.'],
['Tomorrow, we ___ visit a museum.',['will','did','were'],0,'“Will” can describe a future plan.'],
['Bao ___ the pictures for our poster.',['draw','drawing','draws'],2,'Use “draws” with he, she or a person’s name.'],
['My books ___ on the shelf.',['is','are','am'],1,'Use “are” with plural “books”.'],
['This bag is ___ than that bag.',['lighter','lightest','light'],0,'Use a comparative with “than”.'],
['Would you like ___ to my picnic?',['coming','came','to come'],2,'The pattern is “would like to” plus a base verb.'],
['We ___ paper to reduce waste.',['recycles','recycle','recycling'],1,'Use the base verb with “we”.'],
['I want ___ a longer story.',['to tell','telling','told'],0,'Use “want to” plus a base verb.']
];
export function childGrammar(goal,index){const item=childPlans[goal]?.[index%14];if(!item)return null;if(goal==='grade5'){const[q,options,correct,why]=grade5Grammar[index%14];return{question:q,options,correct,why}}const word=item.word[0];const question=item.word[2].replace(new RegExp('\\b'+word+'\\b','i'),'___');const other=[childPlans.grade1[(index+1)%14].word[0],childPlans.grade1[(index+2)%14].word[0]];const correct=index%3;other.splice(correct,0,word);return{question,options:other,correct,why:`Say “${word}”. ${item.word[2]}`}}
