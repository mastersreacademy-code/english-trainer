export const topics={conversation:['Introducing yourself','Your daily routine','Ordering a coffee','Talking about hobbies','Making plans','Asking for directions','Your week in review'],work:['Introducing your work','Your working day','Asking for help','Arranging a meeting','Giving an update','Explaining a problem','Your week in review'],travel:['Meeting new people','At the airport','Ordering food','Checking into a hotel','Buying a ticket','Asking for directions','Your week in review']};
export const vocabulary=[['confident','tự tin','I feel confident when I practise.'],['usually','thường xuyên','I usually study after dinner.'],['improve','cải thiện','I want to improve my English.'],['available','có sẵn / rảnh','Are you available tomorrow?'],['prefer','thích hơn','I prefer tea to coffee.'],['journey','hành trình','Learning is a journey.'],['explain','giải thích','Could you explain that again?']];
export function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function dayIndex(start,now=new Date()){const a=start.split('-').map(Number);return Math.max(0,Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())-Date.UTC(a[0],a[1]-1,a[2]))/86400000))}
export function lesson(profile,completed){const index=completed.length%7;return {index,title:topics[profile.goal][index],minutes:profile.minutes,level:profile.level,word:vocabulary[index],review:index===6}}
export function reviewInterval(rating){return rating==='again'?0:rating==='hard'?1:3}

const conversations={
conversation:[
['Hello! I’m Alex. I’m from Sydney. I’m learning English so I can meet new people. What is your name?','Where is Alex from?',['Sydney','London','Paris'],0],
['I usually get up at seven. I work during the day and practise English after dinner. That routine helps me improve.','When does Alex practise?',['Before work','After dinner','At lunchtime'],1],
['Hello, could I have a small coffee, please? I prefer it with milk and no sugar. How much is that?','What does the customer want?',['Tea with sugar','Black coffee','Coffee with milk'],2],
['On weekends I enjoy walking and taking photos. My friend prefers swimming. We both like spending time outdoors.','What does the speaker enjoy?',['Walking and photography','Swimming only','Cooking'],0],
['Are you available on Saturday? Let’s meet at the park at ten. If it rains, we can go to the café instead.','When will they meet?',['Sunday at ten','Saturday at ten','Saturday at two'],1],
['Excuse me, where is the station? Go straight ahead and turn left at the library. The station is next to the supermarket.','Where should you turn left?',['At the bank','At the station','At the library'],2],
['This week I introduced myself, ordered a coffee and made plans with a friend. I still need to practise asking for directions.','What needs more practice?',['Asking for directions','Ordering coffee','Making plans'],0]],
work:[
['Hello, I’m Alex. I work in a small team. I help customers and organise appointments. I want to feel confident speaking at work.','What does Alex organise?',['Holidays','Appointments','Concerts'],1],
['I start work at nine. First I check my messages. Then I meet my team to discuss our tasks for the day.','What happens first?',['A team lunch','A client visit','Checking messages'],2],
['Could you help me with this report? I understand the first section, but could you explain the last question again?','What does the speaker need help with?',['A report','A payment','A booking'],0],
['Are you available for a meeting on Tuesday? Ten o’clock works for me. I’ll send you an invitation this afternoon.','When is the meeting?',['Monday','Tuesday','Friday'],1],
['Here is a quick update. The first task is finished. I’m working on the second task and expect to finish it tomorrow.','When should the second task be finished?',['Today','Next month','Tomorrow'],2],
['There is a problem with the booking system. I cannot save a new appointment. Could you check it before our next customer arrives?','What cannot be saved?',['A new appointment','An email','A photo'],0],
['This week I practised asking for help and giving updates. Next week I want to explain problems more clearly to my team.','What is next week’s goal?',['Taking holidays','Explaining problems clearly','Writing invitations'],1]],
travel:[
['Hi, I’m Alex. This is my first visit to Vietnam. I’m staying for two weeks and hope to try some local food.','How long is the visit?',['Two days','One month','Two weeks'],2],
['Excuse me, where can I check in for my flight? Please go to desk twelve. Have your passport and ticket ready.','Which desk should the traveller use?',['Twelve','Twenty','Two'],0],
['Could I see the menu, please? I would like rice with vegetables. Does this dish contain peanuts? I need to check before ordering.','What ingredient does the customer ask about?',['Milk','Peanuts','Eggs'],1],
['Hello, I have a reservation under Alex. Could I check in, please? Your room is ready. Breakfast is served from seven to ten.','When does breakfast start?',['Six','Ten','Seven'],2],
['A return ticket to the city, please. The next train leaves at half past two from platform four.','Which platform should the traveller use?',['Four','Two','Three'],0],
['Excuse me, how do I get to the museum? Walk across the bridge, then turn right. It is opposite the park.','Where is the museum?',['Next to the hotel','Opposite the park','Inside the station'],1],
['I can now buy a ticket and check into a hotel. Asking for directions is still difficult, so I will review that lesson tomorrow.','What will the traveller review?',['Hotel bookings','Buying tickets','Directions'],2]]};
export function listening(goal,index,level='beginner'){
const [script,question,options,correct]=conversations[goal][index%7];
return {script:level==='intermediate'?script+' Listen again and explain the main idea in your own words.':script,question,options,correct};
}
