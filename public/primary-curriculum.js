// Family Learning primary-school curriculum catalogue.
// Original practice examples; curriculum mapping is provisional until reviewed
// against the subject-specific GDPT 2018 expected learning outcomes.
export const primarySubjects = Object.freeze([
  {id:'math',name:'Toán',grades:[1,2,3,4,5]},
  {id:'vietnamese',name:'Tiếng Việt',grades:[1,2,3,4,5]}
]);
const curriculum = {
  math: {
    1:['Số và phép tính trong phạm vi 10','Số và phép tính trong phạm vi 100','Hình phẳng và hình khối','Đo độ dài và thời gian'],
    2:['Số trong phạm vi 1000','Cộng và trừ','Làm quen phép nhân và phép chia','Độ dài, khối lượng và thời gian'],
    3:['Số trong phạm vi 100000','Nhân và chia','Phân số bước đầu','Chu vi và diện tích'],
    4:['Số tự nhiên và phép tính','Phân số và phép tính','Đại lượng và đo đại lượng','Hình học và giải toán'],
    5:['Số thập phân và phép tính','Tỉ số phần trăm','Hình học và đo lường','Giải toán có lời văn']
  },
  vietnamese: {
    1:['Âm, vần và chữ','Đọc từ và câu','Chính tả cơ bản','Nói và nghe'],
    2:['Đọc hiểu văn bản ngắn','Từ và câu','Chính tả','Viết đoạn văn ngắn'],
    3:['Đọc hiểu','Mở rộng vốn từ','Câu và dấu câu','Viết đoạn văn'],
    4:['Đọc hiểu văn bản','Luyện từ và câu','Viết bài văn','Nói và nghe'],
    5:['Đọc hiểu và suy luận','Từ ngữ và ngữ pháp','Viết bài văn','Thuyết trình và trao đổi']
  }
};
const examples = {
  math: {
    1:[['3 + 4 = ?',7,5,8],['9 - 2 = ?',7,6,8]],
    2:[['25 + 17 = ?',42,32,43],['3 × 4 = ?',12,7,14]],
    3:[['125 + 230 = ?',355,345,365],['24 : 6 = ?',4,3,6]],
    4:[['3/4 + 1/4 = ?',1,'1/2','2/4'],['125 × 4 = ?',500,400,525]],
    5:[['2,5 + 1,25 = ?','3,75','3,25','4,75'],['20% của 150 là bao nhiêu?',30,20,25]]
  },
  vietnamese: {
    1:[['Từ nào chỉ một con vật?','con mèo','cái bàn','quyển vở'],['Từ nào có vần “an”?','bàn','bút','mây']],
    2:[['Từ nào chỉ hoạt động?','chạy','xanh','cao'],['Dấu nào kết thúc câu hỏi?','?','.','!']],
    3:[['Trong câu “Lan đang đọc sách”, từ chỉ hoạt động là gì?','đọc','Lan','sách'],['Từ nào trái nghĩa với “chăm chỉ”?','lười biếng','siêng năng','cần cù']],
    4:[['Trong câu “Mặt trời mỉm cười”, biện pháp nào được sử dụng?','nhân hoá','so sánh','liệt kê'],['Từ nào là tính từ?','dịu dàng','chạy','bàn']],
    5:[['Từ “đầu” trong “đầu nguồn” được dùng theo nghĩa nào?','nghĩa chuyển','nghĩa gốc','từ đồng âm'],['Cặp từ nào là từ trái nghĩa?','cao – thấp','cao – lớn','nhanh – mau']]
  }
};
export function primaryTopics(subject,grade){
  if(!primarySubjects.some(s=>s.id===subject)||!Number.isInteger(grade)||grade<1||grade>5)throw new RangeError('Invalid primary subject or grade');
  return curriculum[subject][grade].map((name,index)=>({id:`${subject}-g${grade}-t${index+1}`,name,subject,grade}));
}
export function primaryPractice(subject,grade){
  const topics=primaryTopics(subject,grade);
  return examples[subject][grade].map(([question,answer,...distractors],index)=>({
    id:`${subject}-g${grade}-q${index+1}`,subject,grade,topicId:topics[index%topics.length].id,
    question,options:[answer,...distractors],correctIndex:0,
    explanation:subject==='math'?'Kiểm tra lại từng bước tính và đối chiếu kết quả.':'Đọc kỹ câu hỏi và xác định nghĩa của từ hoặc câu.'
  }));
}
