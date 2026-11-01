export const topics={conversation:['Introducing yourself','Your daily routine','Ordering a coffee','Talking about hobbies','Making plans','Asking for directions','Your week in review'],work:['Introducing your work','Your working day','Asking for help','Arranging a meeting','Giving an update','Explaining a problem','Your week in review'],travel:['Meeting new people','At the airport','Ordering food','Checking into a hotel','Buying a ticket','Asking for directions','Your week in review']};
export const vocabulary=[['confident','tự tin','I feel confident when I practise.'],['usually','thường xuyên','I usually study after dinner.'],['improve','cải thiện','I want to improve my English.'],['available','có sẵn / rảnh','Are you available tomorrow?'],['prefer','thích hơn','I prefer tea to coffee.'],['journey','hành trình','Learning is a journey.'],['explain','giải thích','Could you explain that again?']];
export function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function dayIndex(start,now=new Date()){const a=start.split('-').map(Number);return Math.max(0,Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())-Date.UTC(a[0],a[1]-1,a[2]))/86400000))}
export function lesson(profile,completed){const index=completed.length%14;return {index,title:topics[profile.goal][index],minutes:profile.minutes,level:profile.level,word:vocabulary[index],review:index===6||index===13}}
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
const [script,question,options,correct]=conversations[goal][index%14];
return {script,question,options,correct};
}

// Week two builds on the first week with new everyday situations.
const secondWeek={
conversation:[
['Sharing an opinion','I prefer learning with a friend because we can help each other. My sister likes studying alone because it is quieter.','Why does the speaker like learning with a friend?',['It is quieter','They can help each other','It is faster'],1],
['Telling a short story','Yesterday I missed the bus, so I walked to work. On the way, I met an old friend. We decided to have lunch together.','How did the speaker get to work?',['By bus','By train','On foot'],2],
['Shopping with confidence','Excuse me, do you have this shirt in a larger size? The colour is perfect, but this one is too small.','What does the customer need?',['A larger size','A different colour','A lower price'],0],
['Making a polite request','Could you turn the music down a little, please? I have a meeting in ten minutes and need to concentrate.','Why does the speaker want quieter music?',['To sleep','To prepare for a meeting','To watch television'],1],
['Explaining a preference','I used to buy lunch every day. Now I bring food from home because it costs less and gives me more time to relax.','Why does the speaker bring lunch?',['The shops are closed','The office has no café','It saves money and time'],2],
['Keeping a conversation going','That sounds interesting! How did you start photography? A friend lent me a camera last year, and I have enjoyed it ever since.','How did the speaker start photography?',['A friend lent a camera','They bought a phone','They joined a course'],0],
['Your two-week reflection','I can now make requests and share my opinions. I am still nervous about telling stories, so that will be my focus next week.','What is the speaker’s next focus?',['Ordering food','Telling stories','Shopping'],1]],
work:[
['Writing a clear email','Hi Sam, could you send me the updated schedule by Thursday? I need it to prepare the customer appointments for Friday. Thank you.','When is the schedule needed?',['Friday','Monday','Thursday'],2],
['Discussing a deadline','The report is due on Friday. I have finished the research, but I need one more day to check the figures.','What still needs checking?',['The figures','The meeting room','The contact details'],0],
['Speaking with a customer','Thank you for waiting. I have checked your booking. We can offer you an appointment on Wednesday afternoon or Thursday morning.','Which option is available?',['Wednesday morning','Thursday morning','Friday afternoon'],1],
['Clarifying instructions','Before I begin, could I check one thing? Should I send the draft to you first, or share it with the whole team?','What does the speaker want to clarify?',['The deadline','The price','Who should receive the draft'],2],
['Making a suggestion','We spend a lot of time in meetings. Why don’t we try a short written update every Monday and meet only when we need to discuss a problem?','What does the speaker suggest?',['A written weekly update','Longer meetings','Daily phone calls'],0],
['Handling a change','Our meeting has moved from Tuesday to Wednesday. The time is still ten o’clock. Please let me know if you are no longer available.','What has changed?',['The time','The day','The location'],1],
['Your two-week reflection','I feel more confident giving updates and asking questions. My next goal is to write shorter emails that are easier for customers to understand.','What is the next goal?',['Longer reports','More meetings','Clearer emails'],2]],
travel:[
['Checking a price','How much is a day pass? It is twelve dollars and includes all buses and trains until midnight. A single ticket is five dollars.','What does the day pass include?',['Buses and trains','Only trains','Only buses'],0],
['Changing a booking','Hello, I need to change my reservation from Friday to Saturday. Is there a room available for two people?','Which night does the traveller want?',['Friday','Saturday','Sunday'],1],
['Understanding an announcement','Attention passengers: the train to Central is delayed by fifteen minutes. It will leave from platform six instead of platform three.','Which platform will the train use?',['Three','Five','Six'],2],
['Asking for assistance','Excuse me, I have lost my bag. It is blue with a small white label. I last saw it near the ticket office.','Where was the bag last seen?',['Near the ticket office','At the hotel','On the bus'],0],
['Making a recommendation','If you enjoy quiet places, visit the garden early in the morning. It becomes busy after eleven, especially on weekends.','When is a quiet time to visit?',['After eleven','Early morning','At midday'],1],
['Describing an experience','The boat trip was shorter than I expected, but the views were wonderful. Next time I would book the longer afternoon tour.','What would the speaker choose next time?',['A morning bus trip','The same short trip','A longer afternoon tour'],2],
['Your two-week reflection','I can ask for help and change a booking. Listening to announcements is still difficult, so I will practise short recordings again next week.','What needs more practice?',['Listening to announcements','Changing bookings','Asking prices'],0]]};
for(const goal of Object.keys(secondWeek)) for(const [title,...exercise] of secondWeek[goal]){topics[goal].push(title);conversations[goal].push(exercise)}
vocabulary.push(
['opinion','ý kiến','In my opinion, daily practice helps.'],
['decide','quyết định','We decided to meet tomorrow.'],
['suitable','phù hợp','Is this time suitable for you?'],
['request','yêu cầu','I have a small request.'],
['instead','thay vào đó','I will walk instead of taking the bus.'],
['experience','trải nghiệm','Tell me about your experience.'],
['reflect','suy ngẫm','I reflect on what I have learned.']);
