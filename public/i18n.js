export const languageKey='english-trainer-language';
let language='en';
try{language=localStorage.getItem(languageKey)==='vi'?'vi':'en'}catch{}
export const locale=()=>language==='vi'?'vi-VN':'en';
const pairs=`
Skip to content|Bỏ qua để đến nội dung
YOUR PERSONAL LEARNING SPACE|KHÔNG GIAN HỌC TẬP CỦA BẠN
Today|Hôm nay
My learning plan|Lộ trình của tôi
Plan library|Thư viện lộ trình
Vocabulary|Từ vựng
My progress|Tiến độ của tôi
Preferences|Cài đặt
A little practice.|Luyện tập một chút.
A bigger world.|Mở ra thế giới.
Your own pace. Your own journey.|Nhịp độ của bạn. Hành trình của bạn.
Progress saved on this browser|Tiến độ được lưu trên trình duyệt này
YOUR LEARNING JOURNAL|NHẬT KÝ HỌC TẬP
Appearance|Giao diện
Sign out|Đăng xuất
Little by little.|Từng chút một.
A world of possibility.|Mở ra bao cơ hội.
Make a little room for English today.|Dành một chút thời gian cho tiếng Anh hôm nay.
Your pace.|Nhịp độ của bạn.
Your kind of progress.|Tiến bộ theo cách của bạn.
TODAY, WELL SPENT|MỘT NGÀY HỌC THẬT Ý NGHĨA
Look how far|Nhìn lại chặng đường
one day can take you.|bạn đã đi hôm nay.
Your practice is saved. Keep your new words close, or enjoy a little extra practice.|Bài học đã được lưu. Ôn lại từ mới hoặc luyện tập thêm một chút nhé.
A few useful words. A conversation to listen to. Something new to say.|Vài từ hữu ích. Một đoạn hội thoại để nghe. Một điều mới để nói.
Open today’s lesson|Mở bài học hôm nay
Review my words|Ôn từ vựng của tôi
SHOWING UP COUNTS|ĐỀU ĐẶN LÀ ĐIỀU QUAN TRỌNG
You made time for learning today. Keep that feeling.|Bạn đã dành thời gian học hôm nay. Hãy giữ tinh thần ấy nhé.
Every small session is a promise kept to yourself.|Mỗi buổi học nhỏ là một lời hứa bạn giữ với chính mình.
ONE LIBRARY. MANY DIRECTIONS.|MỘT THƯ VIỆN. NHIỀU HƯỚNG ĐI.
Your English can go further.|Tiếng Anh của bạn còn có thể tiến xa hơn.
Classes 1–12, vocabulary, conversation, writing, and specialist paths for teachers, developers and business.|Lớp 1–12, từ vựng, hội thoại, viết và lộ trình dành cho giáo viên, lập trình viên, người làm kinh doanh.
YOUR STARTING POINT|ĐIỂM KHỞI ĐẦU CỦA BẠN
A little clarity goes a long way.|Hiểu rõ điểm xuất phát để tiến xa hơn.
Keep building your confidence.|Tiếp tục xây dựng sự tự tin.
Six short questions can help choose your starting difficulty.|Sáu câu hỏi ngắn giúp bạn chọn mức luyện tập ban đầu.
Check my level|Kiểm tra trình độ
WORDS BECOME YOURS WHEN YOU USE THEM|DÙNG TỪ ĐỂ BIẾN TỪ THÀNH CỦA MÌNH
A few lines. A little progress.|Vài dòng viết. Một chút tiến bộ.
Your writing is a record of the English you’re making your own.|Những dòng viết ghi lại tiếng Anh bạn đang từng bước làm chủ.
Open my journal|Mở nhật ký của tôi
A LITTLE HELP GOES A LONG WAY|MỘT CHÚT HỖ TRỢ, NHIỀU TIẾN BỘ
Learn together, one small step.|Cùng học, từng bước nhỏ.
Listen together, repeat a word and copy it. A grown-up can help with the buttons.|Cùng nghe, nhắc lại rồi chép một từ. Người lớn có thể hỗ trợ thao tác.
Read, listen, explain an answer and write a few sentences. Adjust the daily time in Preferences.|Đọc, nghe, giải thích câu trả lời và viết vài câu. Điều chỉnh thời gian học trong Cài đặt.
Explore my school plan|Xem lộ trình theo lớp
Listen, say a word and have a little fun.|Nghe, nói một từ và học thật vui nhé.
A short story, a useful sentence and something new to say.|Một câu chuyện ngắn, một câu hữu ích và một điều mới để nói.
YOUR PERSONAL PLAN|LỘ TRÌNH CÁ NHÂN
Your next chapter|Chặng đường tiếp theo
starts here.|bắt đầu từ đây.
Choose a path for your school year, a skill to strengthen, or the work you do.|Chọn lộ trình theo lớp, kỹ năng cần cải thiện hoặc công việc của bạn.
Display name|Tên hiển thị
Learning plan|Lộ trình học
Preview and compare all plans →|Xem trước và so sánh các lộ trình →
Practice support|Mức hỗ trợ luyện tập
Guided — shorter speaking and writing|Có hướng dẫn — nói và viết ngắn hơn
Stretch — longer answers and reasons|Thử thách — trả lời dài hơn, giải thích lý do
Daily practice target|Thời gian học mỗi ngày
Each plan keeps its own session position. Your saved words, writing and daily history stay in your workspace.|Mỗi lộ trình lưu vị trí bài học riêng. Từ vựng, bài viết và lịch sử học vẫn ở trong không gian của bạn.
Save preferences|Lưu cài đặt
Please enter a name.|Vui lòng nhập tên.
A PATH FOR EVERY CHAPTER|LỘ TRÌNH CHO TỪNG CHẶNG ĐƯỜNG
English for|Tiếng Anh cho
 your world.| thế giới của bạn.
your world.|thế giới của bạn.
Choose your class. Strengthen a skill. Bring English into your working day.|Chọn lớp học. Rèn luyện kỹ năng. Mang tiếng Anh vào công việc mỗi ngày.
learning paths|lộ trình học
guided sessions|buổi học có hướng dẫn
Your space · any path|Không gian của bạn · Tự do chọn lộ trình
Find a plan|Tìm lộ trình
Find your next path|Tìm lộ trình tiếp theo
Try Class 3, vocabulary, developer…|Thử: lớp 3, từ vựng, lập trình viên…
Suggested starting point|Mức khởi đầu gợi ý
All starting points|Mọi mức khởi đầu
Foundations|Nền tảng
Developing & extending|Phát triển và nâng cao
Plan category|Nhóm lộ trình
All plans|Tất cả
School|Theo lớp
Skills|Kỹ năng
Work & careers|Công việc & nghề nghiệp
Everyday life|Đời sống hằng ngày
FOUNDATIONS|NỀN TẢNG
DEVELOPING & EXTENDING|PHÁT TRIỂN & NÂNG CAO
CAREER PATH|THEO NGHỀ NGHIỆP
SKILL FOCUS|RÈN KỸ NĂNG
EVERYDAY|ĐỜI SỐNG
Preview lessons & outcomes|Xem bài học và mục tiêu
Continue this plan|Tiếp tục lộ trình này
Resume this plan|Học tiếp lộ trình này
Choose this plan|Chọn lộ trình này
No matching paths yet.|Chưa tìm thấy lộ trình phù hợp.
Try a broader search or select All plans.|Thử từ khóa khác hoặc chọn Tất cả.
Reset filters|Đặt lại bộ lọc
A starting unit, then steady practice.|Bắt đầu bằng một học phần, rồi luyện tập đều đặn.
Each path is a complete starter unit with vocabulary, a listening or reading passage, a contextual language question, speaking and writing. Repeat it to consolidate your learning. These units are not a full academic-year curriculum.|Mỗi lộ trình là một học phần khởi đầu gồm từ vựng, bài nghe hoặc đọc, câu hỏi ngôn ngữ theo ngữ cảnh, nói và viết. Học lại để củng cố kiến thức. Đây chưa phải chương trình trọn năm học.
Class labels guide the complexity of general English practice; they are not aligned to a specific textbook or exam board. Foundations and extending are suggested starting points, not certified CEFR levels. Vietnamese word meanings are included.|Nhãn lớp gợi ý độ khó của bài luyện tiếng Anh tổng quát, không theo sách giáo khoa hay kỳ thi cụ thể. Mức nền tảng và nâng cao chỉ mang tính gợi ý, không phải chứng nhận CEFR. Các từ đều có nghĩa tiếng Việt.
A clear path.|Một lộ trình rõ ràng.
One day at a time.|Mỗi ngày một bước.
Change plan →|Đổi lộ trình →
General school-level practice, not a textbook curriculum.|Bài luyện tổng quát theo lớp, không phải chương trình sách giáo khoa.
Your next session|Bài học tiếp theo
Completed this cycle|Đã hoàn thành trong lượt này
Preview & practise|Xem trước và luyện tập
Five guided activities|Năm hoạt động có hướng dẫn
Start →|Bắt đầu →
Practise|Luyện tập
← Save & leave|← Lưu và thoát
A word for your world.|Một từ cho thế giới của bạn.
Tune your ear.|Luyện đôi tai.
Play with a word.|Chơi cùng từ mới.
Build a better sentence.|Tạo một câu rõ ràng hơn.
Find your voice.|Tự tin cất lời.
Make it your own.|Biến kiến thức thành của mình.
TODAY’S USEFUL WORD|TỪ HỮU ÍCH HÔM NAY
♫ Hear pronunciation|♫ Nghe phát âm
Save word|Lưu từ
✓ Saved to vocabulary|✓ Đã lưu vào từ vựng
Say it out loud, then try your own sentence.|Đọc thành tiếng, rồi thử đặt câu của riêng bạn.
♫ Play conversation|♫ Nghe hội thoại
Read the transcript|Xem nội dung bài nghe
A LITTLE WORD GAME|TRÒ CHƠI TỪ VỰNG NHỎ
A PATTERN YOU CAN USE|MẪU CÂU CÓ THỂ ÁP DỤNG
♫ Hear a model|♫ Nghe mẫu
Listen to yourself|Nghe lại giọng của mình
Optional recording stays in this tab and disappears when you leave the page. No pronunciation score.|Bản ghi âm tùy chọn chỉ nằm trong thẻ này và sẽ mất khi rời trang. Không chấm điểm phát âm tự động.
Record my voice|Ghi âm giọng của tôi
I said the word out loud|Tôi đã đọc từ thành tiếng
I practised speaking out loud|Tôi đã luyện nói thành tiếng
Your word|Từ của bạn
Your sentences|Câu của bạn
Type a word…|Nhập một từ…
Start with a small idea…|Bắt đầu từ một ý nhỏ…
See a model|Xem bài mẫu
Copying one word is enough today. Say it together.|Hôm nay chỉ cần chép một từ là đủ. Hãy cùng đọc từ đó.
Use this as inspiration. The checklist checks simple patterns, not full grammar or meaning.|Dùng bài mẫu để tham khảo. Danh sách chỉ kiểm tra vài mẫu cơ bản, không đánh giá toàn bộ ngữ pháp hay ý nghĩa.
YOUR PRACTICE ROUTE|CÁC BƯỚC LUYỆN TẬP
Useful words|Từ hữu ích
Listen & understand|Nghe và hiểu
Grammar in action|Vận dụng ngôn ngữ
Speak with confidence|Tự tin nói
Write your own story|Viết theo ý mình
A new word|Một từ mới
Listen together|Cùng nghe
Play with words|Chơi cùng từ
Say it out loud|Đọc thành tiếng
Copy a word|Chép một từ
Progress comes from trying.|Thử sức để tiến bộ.
Take your time.|Cứ từ từ nhé.
← Previous|← Quay lại
Continue →|Tiếp tục →
Finish session ✓|Hoàn thành buổi học ✓
Your writing and current step are saved automatically on this browser.|Bài viết và bước học hiện tại được tự động lưu trên trình duyệt này.
Choose the correct listening answer to continue.|Chọn đáp án nghe đúng để tiếp tục.
Choose the correct grammar answer to continue.|Chọn đáp án ngôn ngữ đúng để tiếp tục.
Practise out loud, then tick the speaking box.|Luyện nói thành tiếng, rồi đánh dấu vào ô xác nhận.
Write a sentence before finishing.|Viết một câu trước khi hoàn thành.
Voice speed|Tốc độ đọc
Slow|Chậm
Steady|Vừa phải
Natural|Tự nhiên
Start with a capital letter|Bắt đầu bằng chữ hoa
Finish with sentence punctuation|Kết thúc bằng dấu câu
Write at least two sentences|Viết ít nhất hai câu
✓ You used today’s word!|✓ Bạn đã dùng từ của hôm nay!
Recording is unavailable in this browser. You can still practise out loud.|Trình duyệt này không hỗ trợ ghi âm. Bạn vẫn có thể luyện nói thành tiếng.
Waiting for microphone permission…|Đang chờ quyền truy cập micrô…
Recording ready. Play it back and try again.|Đã ghi âm xong. Nghe lại và thử thêm lần nữa.
Record again|Ghi âm lại
Stop recording|Dừng ghi âm
Recording… stops automatically after 90 seconds.|Đang ghi âm… sẽ tự dừng sau 90 giây.
Microphone unavailable or permission declined. Practise out loud instead.|Không thể dùng micrô hoặc chưa được cấp quyền. Hãy luyện nói thành tiếng.
Practice complete. Tick the box when you’re ready.|Luyện tập xong. Đánh dấu vào ô khi bạn đã sẵn sàng.
ONE MORE STEP FORWARD|THÊM MỘT BƯỚC TIẾN
You showed up.|Bạn đã dành thời gian học.
That’s how progress starts.|Tiến bộ bắt đầu từ đó.
Your session is saved. Let today’s words become part of tomorrow.|Buổi học đã được lưu. Hãy mang những từ hôm nay vào ngày mai.
Review my words →|Ôn từ vựng →
See my progress|Xem tiến độ
That word is already in your collection.|Từ đó đã có trong bộ sưu tập của bạn.
Saved to your vocabulary.|Đã lưu vào từ vựng của bạn.
YOUR PERSONAL WORD COLLECTION|BỘ SƯU TẬP TỪ VỰNG CỦA BẠN
Keep your words|Giữ những từ mới
within reach.|luôn trong tầm tay.
CAN YOU REMEMBER THE MEANING?|BẠN CÒN NHỚ NGHĨA KHÔNG?
♫ Listen|♫ Nghe
Again today|Ôn lại hôm nay
Tomorrow|Ngày mai
Reveal meaning|Xem nghĩa
You’re all caught up.|Bạn đã ôn xong rồi!
Your next review will appear when it’s due. Add your own useful words below.|Từ cần ôn sẽ xuất hiện khi đến hạn. Thêm từ hữu ích của bạn ở dưới nhé.
Your collection|Bộ sưu tập của bạn
Search vocabulary|Tìm từ vựng
Find a word…|Tìm một từ…
A word worth keeping|Một từ đáng ghi nhớ
English word|Từ tiếng Anh
Meaning in your own words|Nghĩa theo cách hiểu của bạn
Example sentence|Câu ví dụ
Due now|Đến hạn ôn
No matching words yet.|Chưa có từ phù hợp.
Enter a word and its meaning.|Nhập từ và nghĩa của từ.
A plan for your school year.|Lộ trình theo lớp của bạn.
Your selected school plan follows its class level. You can choose a different path in the plan library.|Lộ trình đang chọn theo cấp lớp. Bạn có thể đổi sang lộ trình khác trong thư viện.
Open my plan →|Mở lộ trình của tôi →
Your starting point.|Điểm khởi đầu của bạn.
Build comfortable, useful sentences and repeat them often.|Tập những câu đơn giản, hữu ích và lặp lại thường xuyên.
Practise explaining reasons, giving examples and extending your answers.|Luyện giải thích lý do, đưa ví dụ và mở rộng câu trả lời.
This is an informal grammar and meaning check, not a CEFR placement test. It does not measure speaking or listening ability.|Đây là kiểm tra ngữ pháp và nghĩa mang tính tham khảo, không phải bài xếp lớp CEFR. Bài này không đo kỹ năng nghe hay nói.
Use this difficulty|Dùng mức luyện tập này
Keep my current difficulty|Giữ mức hiện tại
Your practice difficulty is updated.|Đã cập nhật mức luyện tập.
← Back|← Quay lại
Find your starting point.|Tìm điểm khởi đầu của bạn.
No pressure. Choose the answer that feels right.|Không áp lực. Chọn đáp án bạn thấy phù hợp.
See my result →|Xem kết quả →
Next question →|Câu tiếp theo →
Notice the small wins.|Ghi nhận những tiến bộ nhỏ.
Consistency comes before perfection.|Đều đặn quan trọng hơn hoàn hảo.
Day practice streak|Chuỗi ngày học liên tục
Listening correct on first attempt|Tỷ lệ nghe đúng lần đầu
Minutes of session time since v2|Số phút học ghi nhận từ phiên bản 2
Session time is elapsed time from start to completion, capped at two hours; it may include breaks. Version 1 completions remain in your history without invented scores.|Thời gian học tính từ lúc bắt đầu đến khi hoàn thành, tối đa hai giờ và có thể gồm thời gian nghỉ. Lịch sử từ phiên bản 1 vẫn được giữ, không tự thêm điểm số.
Your writing journal|Nhật ký viết của bạn
Your first piece of writing will appear here.|Bài viết đầu tiên của bạn sẽ xuất hiện ở đây.
YOUR ACCOUNT|TÀI KHOẢN CỦA BẠN
Your account|Tài khoản của bạn
Signed in as|Đăng nhập với tên
. Your learning workspace and the full plan library are available after signing in.|. Sau khi đăng nhập, bạn có thể sử dụng không gian học và toàn bộ thư viện lộ trình.
Change password|Đổi mật khẩu
Current password|Mật khẩu hiện tại
New password|Mật khẩu mới
Confirm new password|Xác nhận mật khẩu mới
Use 12–128 characters. Changing the password signs out every device. Your saved learning progress stays in this browser.|Dùng 12–128 ký tự. Đổi mật khẩu sẽ đăng xuất mọi thiết bị. Tiến độ học vẫn được lưu trong trình duyệt này.
Change password & sign out|Đổi mật khẩu và đăng xuất
The new passwords do not match.|Mật khẩu mới và phần xác nhận chưa khớp.
Updating your password…|Đang cập nhật mật khẩu…
Your learning tools|Công cụ học của bạn
Slow playback is recommended to start. Practise with a grown-up when helpful.|Nên bắt đầu ở tốc độ chậm. Nhờ người lớn cùng luyện khi cần.
Take the starting-level check →|Làm bài kiểm tra ban đầu →
Keep your progress safe|Lưu giữ tiến độ của bạn
Your workspace holds progress for every plan. A backup includes your saved words, writing and plan positions.|Không gian học lưu tiến độ của mọi lộ trình. Bản sao lưu gồm từ đã lưu, bài viết và vị trí bài học.
Export backup|Xuất bản sao lưu
Export previous profiles|Xuất dữ liệu hồ sơ cũ
Previous profile data, if present, stays unchanged in this browser. You can export it or restore one profile from an old backup.|Dữ liệu hồ sơ cũ, nếu có, vẫn được giữ nguyên trong trình duyệt. Bạn có thể xuất dữ liệu đó hoặc khôi phục một hồ sơ từ bản sao lưu cũ.
Choose a backup to restore|Chọn bản sao lưu để khôi phục
Previous profile to restore|Chọn hồ sơ cũ để khôi phục
Restore this backup? This replaces your current workspace. Export your current progress first if you want to keep both.|Khôi phục bản sao lưu này? Dữ liệu hiện tại sẽ được thay thế. Hãy xuất tiến độ hiện tại trước nếu bạn muốn giữ cả hai.
Restore this backup|Khôi phục bản sao lưu này
Cancel|Hủy
Backup restored.|Đã khôi phục bản sao lưu.
Could not restore. Your saved backup file is unchanged.|Không thể khôi phục. Tệp sao lưu của bạn không bị thay đổi.
This backup is invalid or has an unknown plan. Nothing has changed.|Bản sao lưu không hợp lệ hoặc chứa lộ trình không được hỗ trợ. Chưa có dữ liệu nào bị thay đổi.
Your browser could not save. Export a backup from Preferences.|Trình duyệt không thể lưu. Hãy xuất bản sao lưu trong Cài đặt.
Let’s protect your progress.|Cùng bảo vệ tiến độ của bạn.
Your browser’s saved data could not be read. It has not been overwritten.|Không đọc được dữ liệu đã lưu. Dữ liệu đó chưa bị ghi đè.
Try reloading or restore a valid backup using Preferences.|Thử tải lại trang hoặc khôi phục bản sao lưu hợp lệ trong Cài đặt.
Open recovery preferences|Mở cài đặt khôi phục
Checking your sign-in…|Đang kiểm tra đăng nhập…
MAKE YOURSELF AT HOME|GIAO DIỆN THEO Ý BẠN
A space that feels like you.|Một không gian mang dấu ấn của bạn.
Choose your light. Pick your colour.|Chọn chế độ sáng tối và màu sắc yêu thích.
Display|Chế độ hiển thị
☀ Light|☀ Sáng
☾ Dark|☾ Tối
◐ System|◐ Theo thiết bị
Colour palette|Bảng màu
Forest|Rừng xanh
Ocean|Đại dương
Dusk|Hoàng hôn
Saved automatically on this browser. System follows your device’s appearance.|Tự động lưu trên trình duyệt này. Chế độ Theo thiết bị dùng giao diện của thiết bị.
Close appearance settings|Đóng cài đặt giao diện
Application version|Phiên bản ứng dụng
A LITTLE PRACTICE. A BIGGER WORLD.|LUYỆN TẬP MỖI NGÀY. MỞ RA THẾ GIỚI.
Your English.|Tiếng Anh của bạn.
A world to explore.|Cả thế giới để khám phá.
Choose a learning path and build your English, one small step at a time.|Chọn lộ trình và nâng cao tiếng Anh, từng bước nhỏ mỗi ngày.
WELCOME BACK|CHÀO MỪNG TRỞ LẠI
Make room for English.|Dành chỗ cho tiếng Anh.
Sign in to your personal learning space.|Đăng nhập vào không gian học của bạn.
Username|Tên đăng nhập
Password|Mật khẩu
Confirm password|Xác nhận mật khẩu
Show password|Hiện mật khẩu
Use 12–128 characters. A long, unique passphrase works well.|Dùng 12–128 ký tự. Nên chọn một cụm mật khẩu dài và riêng biệt.
Sign in →|Đăng nhập →
One learning space. Every plan at your fingertips. Learning progress stays saved in this browser.|Một không gian học với mọi lộ trình trong tầm tay. Tiến độ được lưu trong trình duyệt này.
YOUR PRIVATE ACTIVATION|KÍCH HOẠT RIÊNG TƯ
Your new beginning.|Khởi đầu mới của bạn.
Choose your username and password. This activation link can be used once.|Chọn tên đăng nhập và mật khẩu. Liên kết kích hoạt chỉ dùng được một lần.
Activate login →|Kích hoạt đăng nhập →
The passwords do not match.|Mật khẩu và phần xác nhận chưa khớp.
Activating your login…|Đang kích hoạt đăng nhập…
Signing in…|Đang đăng nhập…
Could not sign in. Please try again.|Không thể đăng nhập. Vui lòng thử lại.
Could not connect. Please try again.|Không thể kết nối. Vui lòng thử lại.
Login is not activated yet. Open the private activation link provided in your chat.|Chưa kích hoạt đăng nhập. Hãy mở liên kết kích hoạt riêng trong cuộc trò chuyện của bạn.
The sign-in service is temporarily unavailable. Please reload to try again.|Dịch vụ đăng nhập tạm thời không khả dụng. Hãy tải lại trang để thử lại.
Invalid username or password.|Tên đăng nhập hoặc mật khẩu chưa đúng.
Please try again.|Vui lòng thử lại.
`;
export const vietnamese=Object.fromEntries(pairs.trim().split('\n').map(line=>line.split('|')));
const schoolNames=['Từ đầu tiên','Thói quen nhỏ','Thế giới của em','Phát triển câu','Nhà khám phá nhỏ','Kết nối mới','Cuộc sống và văn hóa','Ý tưởng và cộng đồng','Lựa chọn tương lai','Suy nghĩ và giải thích','Bằng chứng và thảo luận','Bước tiếp theo'];
const schoolEnglish=['First words','Little routines','My world','Growing sentences','Young explorers','New connections','Life & culture','Ideas & community','Future choices','Think & explain','Evidence & discussion','Next steps'];
schoolNames.forEach((name,i)=>vietnamese[`Class ${i+1} · ${schoolEnglish[i]}`]=`Lớp ${i+1} · ${name}`);
Object.assign(vietnamese,{
 'Everyday conversation':'Hội thoại hằng ngày','Everyday conversations':'Hội thoại hằng ngày','Everyday workplace':'Tiếng Anh nơi làm việc','Confidence at work':'Tự tin nơi làm việc','Travel with confidence':'Tự tin khi du lịch','A world to explore':'Khám phá thế giới','Vocabulary builder':'Xây dựng vốn từ','Listening focus':'Luyện nghe','Reading focus':'Luyện đọc','Writing focus':'Luyện viết','Grammar in context':'Ngữ pháp theo ngữ cảnh','Pronunciation & clarity':'Phát âm rõ ràng','English for teachers':'Tiếng Anh cho giáo viên','English for developers':'Tiếng Anh cho lập trình viên','Business communication':'Giao tiếp kinh doanh','Class 1 first words':'Lớp 1 · Từ đầu tiên','Class 5 explorers':'Lớp 5 · Nhà khám phá nhỏ',
 'Small talk, requests and real connections.':'Trò chuyện, đề nghị và kết nối trong đời sống.','Updates, meetings and customer communication.':'Cập nhật công việc, họp và giao tiếp với khách hàng.','Bookings, directions and help away from home.':'Đặt chỗ, hỏi đường và nhờ hỗ trợ khi đi xa.','Chunks, word families, collocations and recall.':'Cụm từ, họ từ, kết hợp từ và ghi nhớ chủ động.','Numbers, changes, reasons and key details.':'Con số, thay đổi, lý do và thông tin chính.','Main ideas, references, instructions and critical reading.':'Ý chính, từ thay thế, hướng dẫn và đọc phản biện.','Clear sentences, paragraphs and useful emails.':'Viết câu rõ ràng, đoạn văn và email hữu ích.','Habits, past events, modals and conditionals.':'Thói quen, sự kiện quá khứ, động từ khuyết thiếu và câu điều kiện.','Stress, endings, sound contrasts and speaking in chunks.':'Trọng âm, âm cuối, phân biệt âm và nói theo cụm.','Classroom instructions, feedback and parent conversations.':'Hướng dẫn trong lớp, nhận xét và trao đổi với phụ huynh.','Stand-ups, bugs, code reviews and technical decisions.':'Họp ngắn, mô tả lỗi, đánh giá mã và quyết định kỹ thuật.','Proposals, negotiations, follow-ups and results.':'Đề xuất, đàm phán, trao đổi tiếp và trình bày kết quả.',
 'Gentle words, colours and playful repetition.':'Từ đơn giản, màu sắc và lặp lại vui nhộn.','Home, play and simple daily routines.':'Gia đình, vui chơi và thói quen hằng ngày.','Describe familiar places, abilities and activities.':'Mô tả nơi quen thuộc, khả năng và hoạt động.','Build sentences about everyday experiences.':'Đặt câu về trải nghiệm hằng ngày.','School stories, plans and invitations.':'Chuyện trường lớp, kế hoạch và lời mời.','Connect ideas and explain a preference.':'Liên kết ý và giải thích sở thích.','Culture, volunteering and shared experiences.':'Văn hóa, tình nguyện và trải nghiệm chung.','Technology, communities and respectful opinions.':'Công nghệ, cộng đồng và trao đổi ý kiến tôn trọng.','Make choices and support an idea.':'Đưa ra lựa chọn và bảo vệ ý kiến.','Explain claims, give feedback and plan projects.':'Giải thích luận điểm, nhận xét và lập kế hoạch dự án.','Discuss evidence, assumptions and perspectives.':'Thảo luận bằng chứng, giả định và góc nhìn.','Develop arguments and prepare for the next step.':'Phát triển lập luận và chuẩn bị bước tiếp theo.',
 'First words & listening':'Từ đầu tiên và luyện nghe','Reading & everyday speaking':'Đọc và giao tiếp hằng ngày','Stories, reasons & discussion':'Câu chuyện, lý do và thảo luận','Academic reading & expression':'Đọc học thuật và diễn đạt','Conversation & practical phrases':'Hội thoại và cụm từ thực tế','Professional communication':'Giao tiếp trong công việc','Listening':'Nghe','Reading':'Đọc','Writing':'Viết','Grammar':'Ngữ pháp','Pronunciation':'Phát âm','Conversation':'Hội thoại','Work':'Công việc','Travel':'Du lịch',
 'Say today’s word and try the example with a grown-up.':'Đọc từ hôm nay và thử câu ví dụ cùng người lớn.','Say three sentences about the topic. Add a detail or a reason.':'Nói ba câu về chủ đề. Thêm một chi tiết hoặc lý do.','Copy today’s word or try the example sentence.':'Chép từ hôm nay hoặc thử câu ví dụ.','Write three sentences about today’s topic using the new word.':'Viết ba câu về chủ đề hôm nay, có dùng từ mới.',
 'Listen to the word. Say it three times. Then try the short example with a grown-up.':'Nghe từ mới. Đọc lại ba lần. Sau đó thử câu ví dụ ngắn cùng người lớn.','Give an example, explain a reason and ask a follow-up question.':'Đưa một ví dụ, giải thích lý do và hỏi thêm một câu.','Say who, what and when. Use short sentences and repeat them slowly.':'Nói ai, làm gì, khi nào. Dùng câu ngắn và lặp lại chậm rãi.',
 'Start with a capital letter':'Bắt đầu bằng chữ hoa','Finish with sentence punctuation':'Kết thúc bằng dấu câu','Write at least two sentences':'Viết ít nhất hai câu','Voice playback is unavailable on this device. You can read the transcript instead.':'Thiết bị này không hỗ trợ đọc thành tiếng. Bạn có thể xem nội dung bài nghe.'
});
const patterns=[
 [/^Learning illustration: (.+)$/,(_,plan)=>`Minh họa học tập: ${translate(plan,'vi')}`],
 [/^(✓ Correct\. |Try again\. )(.+)$/,(_,prefix,rest)=>`${translate(prefix.trim(),'vi')} ${translate(rest,'vi')}`],
 [/^([✓○] )(.+)$/,(_,prefix,rest)=>prefix+translate(rest,'vi')],
 [/^(✓ Correct\. |Try again\. )(.+)$/,(_,prefix,rest)=>`${translate(prefix.trim(),'vi')} ${translate(rest,'vi')}`],
 [/^Use “(.+)” in this context\. (.+)$/,(_,word,example)=>`Dùng “${word}” trong ngữ cảnh này. ${example}`],

 [/^WELCOME BACK, (.*)$/,(_,name)=>`CHÀO MỪNG TRỞ LẠI${name==='LEARNER'?'':', '+name}`],
 [/^WEEK (\d+) · SESSION (\d+)$/,(_,week,session)=>`TUẦN ${week} · BUỔI ${session}`],
 [/^Version (.+)$/,(_,v)=>`Phiên bản ${v}`],
 [/^(\d+) min target$/,(_,n)=>`Mục tiêu ${n} phút`],
 [/^◷ (\d+) min target$/,(_,n)=>`◷ Mục tiêu ${n} phút`],
 [/^5 activities$/,()=> '5 hoạt động'],
 [/^day streak$/,()=> 'ngày liên tục'],
 [/^daily sessions$/,()=> 'buổi học hằng ngày'],[/^saved words$/,()=> 'từ đã lưu'],
 [/^(\d+) ready to review$/,(_,n)=>`${n} từ đến hạn ôn`],
 [/^Explore (\d+) plans$/,(_,n)=>`Khám phá ${n} lộ trình`],
 [/^(\d+) minutes$/,(_,n)=>`${n} phút`],
 [/^(\d+) plans? found · your progress is saved separately for each plan$/,(_,n)=>`Tìm thấy ${n} lộ trình · Tiến độ được lưu riêng cho từng lộ trình`],
 [/^(\d+) sessions · (\d+) completed across cycles$/,(_,n,c)=>`${n} buổi · Đã hoàn thành ${c} buổi qua các lượt`],
 [/^CLASS (\d+)$/,(_,n)=>`LỚP ${n}`],
 [/^Class (\d+)$/,(_,n)=>`Lớp ${n}`],
 [/^(.+) selected\.$/,(_,name)=>`Đã chọn ${translate(name,'vi')}.`],
 [/^(.+) in the real world$/,(_,name)=>`${translate(name,'vi')} trong thực tế`],
 [/^(.+) · YOUR LEARNING PATH$/,(_,name)=>`${translateTitle(name)} · LỘ TRÌNH HỌC CỦA BẠN`],
 [/^(\d+) sessions · (.+) · Cycle (\d+)\. Missed days never skip a lesson\.$/,(_,n,name,c)=>`${n} buổi · ${translate(name,'vi')} · Lượt ${c}. Nghỉ một ngày không làm bỏ qua bài học.`],
 [/^Unit (\d+) · (Build confidence|Build a foundation)$/,(_,n,label)=>`Học phần ${n} · ${label==='Build confidence'?'Xây dựng sự tự tin':'Xây nền tảng'}`],
 [/^(\d+) sessions$/,(_,n)=>`${n} buổi`],
 [/^(Completed this cycle|Your next session|Preview & practise) · Five guided activities$/,(_,s)=>`${translate(s,'vi')} · Năm hoạt động có hướng dẫn`],
 [/^After (\d+) sessions, repeat this starter unit\. Extra practice does not change your daily streak or plan position\. You can complete one daily session each day; switching plans does not erase that daily completion\.$/,(_,n)=>`Sau ${n} buổi, hãy học lại học phần để củng cố. Luyện thêm không thay đổi chuỗi ngày học hay vị trí bài. Bạn có thể hoàn thành một buổi hằng ngày; đổi lộ trình không xóa lần hoàn thành trong ngày.`],
 [/^(Daily session|Extra practice) · (\d+) of 5$/,(_,label,n)=>`${label==='Daily session'?'Buổi học hằng ngày':'Luyện thêm'} · Bước ${n}/5`],
 [/^Extra practice$/,()=> 'Luyện thêm'],
 [/^Talk about$/,()=> 'Nói về'],
 [/^Start (\d+)-second practice$/,(_,n)=>`Bắt đầu luyện ${n} giây`],
 [/^(\d+) seconds — speak at your own pace\.$/,(_,n)=>`${n} giây — nói theo nhịp độ của bạn.`],
 [/^(\d+) seconds remaining$/,(_,n)=>`Còn ${n} giây`],
 [/^Try the word “(.+)”$/,(_,w)=>`Thử dùng từ “${w}”`],
 [/^(\d+) words · Writing checklist$/,(_,n)=>`${n} từ · Danh sách kiểm tra bài viết`],
 [/^(\d+) words? · One word is a good start\.$/,(_,n)=>`${n} từ · Một từ cũng là khởi đầu tốt.`],
 [/^Try copying: (.+)$/,(_,w)=>`Thử chép: ${w}`],
 [/^In (\d+) days$/,(_,n)=>`Sau ${n} ngày`],
 [/^Review (\d{4}-\d\d-\d\d)$/,(_,date)=>`Ôn vào ${date}`],
 [/^(\d+) words? ready for review · (\d+) saved\.$/,(_,n,c)=>`${n} từ đến hạn ôn · ${c} từ đã lưu.`],
 [/^(\d+) daily sessions? · (\d+) saved words?$/,(_,n,c)=>`${n} buổi học hằng ngày · ${c} từ đã lưu`],
 [/^Question (\d+) of 6$/,(_,n)=>`Câu ${n}/6`],
 [/^(\d+) OF (\d+) CORRECT$/,(_,n,c)=>`ĐÚNG ${n}/${c} CÂU`],
 [/^Suggested practice: (beginner|intermediate)$/,(_,l)=>`Mức luyện tập gợi ý: ${l==='beginner'?'nền tảng':'nâng cao'}`],
 [/^Use “(.+)” to explain your own example of (.+)\. Then ask a question\.$/,(_,w,title)=>`Dùng “${w}” để trình bày ví dụ của bạn về chủ đề “${title}”. Sau đó đặt một câu hỏi.`],
 [/^Write a short response about (.+)\. Use “(.+)” and include one specific detail\.$/,(_,title,w)=>`Viết ngắn về chủ đề “${title}”. Dùng “${w}” và thêm một chi tiết cụ thể.`],
 [/^Write (two|three|four) sentences about$/,(_,n)=>`Viết ${n==='two'?'hai':n==='three'?'ba':'bốn'} câu về`],
 [/^Copy the word$/,()=> 'Chép từ'],[/^, or try a short sentence\. A grown-up can help you type\.$/,()=> ', hoặc thử một câu ngắn. Người lớn có thể giúp bạn gõ.'],
 [/^\. Try using$/,()=> '. Thử dùng'],[/^and explain a reason$/,()=> 'và giải thích lý do']
];
let compositePairs;
function translateTitle(text){const match=Object.keys(vietnamese).find(key=>key.toUpperCase()===text);return match?vietnamese[match]:text}
export function translate(text,lang=language){if(lang!=='vi'||!text)return text;const trimmed=text.trim();let result=Object.hasOwn(vietnamese,trimmed)?vietnamese[trimmed]:undefined;if(result===undefined){for(const[pattern,replace]of patterns)if(pattern.test(trimmed)){result=trimmed.replace(pattern,replace);break}}if(result===undefined){let composite=trimmed;for(const[key,value]of (compositePairs??=Object.entries(vietnamese).filter(([key])=>key.length>30).sort((a,b)=>b[0].length-a[0].length)))composite=composite.split(key).join(value);if(composite!==trimmed)result=composite}if(result===undefined)return text;return text.slice(0,text.indexOf(trimmed))+result+text.slice(text.indexOf(trimmed)+trimmed.length)}
export function languageControl(){return `<button type="button" class="appearance-button language-button" data-language-open aria-haspopup="dialog" aria-controls="language-dialog"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg><span>Language</span><span class="language-current" data-language-current data-learning-content>${language==='vi'?'VI':'EN'}</span></button>`}
function languageDialog(){return `<dialog id="language-dialog" aria-labelledby="language-title"><div class="dialog-top"><span class="eyebrow">MAKE YOURSELF AT HOME</span><button type="button" class="icon-button" data-language-close aria-label="Close language settings">×</button></div><h2 id="language-title">Choose your language.</h2><p>Use the interface that feels natural to you.</p><div class="language-options" role="group" aria-label="Interface language"><button type="button" data-language-choice="en" aria-pressed="${language==='en'}"><span class="language-code" data-learning-content>EN</span><span lang="en" data-learning-content>English</span><svg class="language-check ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></button><button type="button" data-language-choice="vi" aria-pressed="${language==='vi'}"><span class="language-code" data-learning-content>VI</span><span lang="vi" data-learning-content>Tiếng Việt</span><svg class="language-check ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></button></div><p class="small">English exercises stay in English. Your language choice is saved automatically.</p></dialog>`}
const originals=new WeakMap(),attributes=new WeakMap();
const protectedSelector='[data-learning-content],script,style,textarea,code,pre';
function updateText(node){if(node.parentElement?.closest(protectedSelector)||!node.nodeValue.trim())return;const previous=originals.get(node);const source=previous&&node.nodeValue===previous.rendered?previous.source:node.nodeValue;const rendered=translate(source);originals.set(node,{source,rendered});if(node.nodeValue!==rendered)node.nodeValue=rendered}
function updateAttributes(el){if(el.closest(protectedSelector))return;let remembered=attributes.get(el);if(!remembered){remembered={};attributes.set(el,remembered)}for(const name of ['placeholder','aria-label','title','label']){if(!el.hasAttribute(name))continue;const previous=remembered[name],value=el.getAttribute(name),source=previous&&value===previous.rendered?previous.source:value,rendered=translate(source);remembered[name]={source,rendered};if(value!==rendered)el.setAttribute(name,rendered)}}
export function applyLanguage(root=document.body){document.documentElement.lang=language;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode())updateText(walker.currentNode);if(root.nodeType===1)updateAttributes(root);root.querySelectorAll('*').forEach(updateAttributes);document.querySelectorAll('[data-language-current]').forEach(el=>{const code=language==='vi'?'VI':'EN';if(el.textContent!==code)el.textContent=code});document.querySelectorAll('[data-language-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.languageChoice===language)));document.querySelectorAll('[data-current-date]').forEach(el=>{el.textContent=new Date().toLocaleDateString(locale(),{weekday:'long',month:'short',day:'numeric'})});document.title=location.pathname.startsWith('/login')?(language==='vi'?'Đăng nhập · English Trainer':'Sign in · English Trainer'):(language==='vi'?'English Trainer — Học tiếng Anh mỗi ngày':'English Trainer — Your everyday English journey')}
export function setLanguage(value){language=value==='vi'?'vi':'en';try{localStorage.setItem(languageKey,language)}catch{}applyLanguage();document.dispatchEvent(new CustomEvent('languagechange',{detail:language}))}
let started=false;
export function initLanguage(){if(started)return;started=true;document.body.insertAdjacentHTML('beforeend',languageDialog());applyLanguage();const dialog=document.querySelector('#language-dialog');document.addEventListener('click',event=>{if(event.target.closest('[data-language-open]')){applyLanguage();dialog.showModal();dialog.querySelector('[aria-pressed="true"]').focus()}if(event.target.closest('[data-language-close]'))dialog.close();const choice=event.target.closest('[data-language-choice]');if(choice){setLanguage(choice.dataset.languageChoice);dialog.close()}});dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close()});let scheduled=false;const observer=new MutationObserver(records=>{if(!records.some(r=>r.type==='childList'||r.type==='characterData'))return;if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;observer.disconnect();applyLanguage();observer.observe(document.body,{subtree:true,childList:true,characterData:true})})});observer.observe(document.body,{subtree:true,childList:true,characterData:true});window.addEventListener('storage',event=>{if(event.key===languageKey){language=event.newValue==='vi'?'vi':'en';applyLanguage()}})}
Object.assign(vietnamese,{'Language':'Ngôn ngữ','Interface language':'Ngôn ngữ giao diện'});
// Skill-specific instructions; English target words stay unchanged.
Object.assign(vietnamese, Object.fromEntries(`
Hide the meaning. Say a phrase with “make an effort”, then use it in a different situation.|Che nghĩa của từ. Nói một cụm với “make an effort”, rồi dùng cụm đó trong tình huống khác.
Write two things you make an effort to do.|Viết hai việc bạn cố gắng thực hiện, dùng “make an effort”.
Describe a reliable person and give one example of their behaviour.|Mô tả một người đáng tin cậy và đưa một ví dụ về hành động của họ.
Write a sentence about a reliable person and explain why you chose that adjective.|Viết một câu về người đáng tin cậy và giải thích vì sao bạn chọn tính từ đó.
Say one sentence with “improve” and another with “improvement”.|Nói một câu với “improve” và một câu khác với “improvement”.
Write two connected sentences using both improve and improvement.|Viết hai câu liên kết với nhau, có dùng cả “improve” và “improvement”.
Name three situations when you take a break.|Kể ba tình huống bạn nghỉ giải lao, dùng “take a break”.
Write a short routine using take a break.|Viết ngắn về thói quen của bạn, có dùng “take a break”.
Explain how you guessed the meaning of icy from context.|Giải thích cách bạn đoán nghĩa của “icy” qua ngữ cảnh.
Write an example with enough context for a reader to guess the meaning of an unfamiliar word.|Viết một ví dụ đủ ngữ cảnh để người đọc đoán nghĩa một từ chưa biết.
Correct a mistaken idea politely using actually.|Dùng “actually” để lịch sự sửa một ý chưa đúng.
Write two lines: an assumption, then a correction beginning Actually.|Viết hai dòng: một giả định, rồi một câu đính chính bắt đầu bằng “Actually”.
Cover today’s example and recall it. Then create a new example.|Che câu ví dụ hôm nay và nhớ lại. Sau đó tự tạo một ví dụ mới.
Recall three words from this unit without looking, then use them in a short paragraph.|Nhớ lại ba từ của học phần mà không xem, rồi dùng chúng trong một đoạn văn ngắn.
Listen without the transcript. Repeat the number and say why it is not fifty.|Nghe mà không xem nội dung. Nhắc lại con số và giải thích vì sao không phải là “fifty”.
Write the number you heard, then a sentence explaining the wait.|Viết con số bạn nghe được, rồi viết một câu giải thích thời gian chờ.
State the old time and the new time without looking.|Không xem bài, hãy nói giờ cũ và giờ mới.
Write a one-sentence update giving the new call time.|Viết một câu cập nhật giờ gọi mới.
Give the two instructions in order, using first and afterwards.|Nói hai hướng dẫn theo thứ tự, dùng “first” và “afterwards”.
Write the two steps in the correct order.|Viết hai bước theo đúng thứ tự.
Role-play accepting the alternative invitation.|Đóng vai người đồng ý với lời mời thay thế.
Write a reply accepting Friday lunch and ask for the time.|Viết câu trả lời đồng ý ăn trưa thứ Sáu và hỏi giờ cụ thể.
Explain which event is cancelled and give the reason.|Giải thích hoạt động nào bị hủy và nêu lý do.
Write a notice explaining the cancellation while keeping the indoor activity.|Viết thông báo giải thích việc hủy hoạt động ngoài trời và xác nhận hoạt động trong nhà vẫn diễn ra.
Separate the ticket-price fact from the speaker’s personal choice.|Phân biệt thông tin về giá vé với lựa chọn cá nhân của người nói.
Write one fact and one preference from the passage.|Viết một thông tin thực tế và một sở thích từ bài nghe.
Repeat only the essential reminder in your own words.|Dùng lời của bạn để nhắc lại thông tin quan trọng nhất.
Write a short reminder with what to bring and what is unnecessary.|Viết lời nhắc ngắn về vật cần mang và vật không cần mang.
Read the passage and summarise its main point without listing every example.|Đọc đoạn văn và tóm tắt ý chính, không cần liệt kê mọi ví dụ.
Write a one-sentence summary of how a garden helps wildlife.|Viết một câu tóm tắt khu vườn giúp động vật hoang dã như thế nào.
Explain exactly what stays open and what closes.|Giải thích rõ khu vực nào vẫn mở và khu vực nào đóng.
Rewrite the notice for someone planning a Tuesday visit.|Viết lại thông báo cho người định đến vào thứ Ba.
Identify Mina, Lan and the object. Explain what it refers to.|Xác định Mina, Lan và đồ vật. Giải thích “it” chỉ điều gì.
Write two sentences with a noun followed by an unambiguous pronoun.|Viết hai câu, dùng danh từ ở câu đầu và đại từ chỉ rõ danh từ đó ở câu sau.
Explain the application requirements in your own words.|Dùng lời của bạn giải thích các yêu cầu nộp hồ sơ.
Write a two-item checklist for the applicant.|Viết danh sách hai việc người nộp hồ sơ cần làm.
Explain how however changes the reader’s expectations.|Giải thích “however” làm thay đổi điều người đọc mong đợi như thế nào.
Write two sentences contrasting a benefit and a difficulty.|Viết hai câu đối chiếu một lợi ích với một khó khăn.
Say which sentence is a fact and which is an opinion.|Nói câu nào là thông tin thực tế, câu nào là ý kiến.
Write one verifiable fact and one clearly signalled opinion.|Viết một thông tin có thể kiểm chứng và một ý kiến được thể hiện rõ là ý kiến.
Explain what evidence would help evaluate the advertisement.|Giải thích cần bằng chứng nào để đánh giá lời quảng cáo.
Write two questions you would ask before believing the claim.|Viết hai câu hỏi bạn sẽ đặt ra trước khi tin vào lời khẳng định.
Say who performs the action in your own example sentence.|Đặt một câu ví dụ và nói ai là người thực hiện hành động.
Write three sentences. Give each a clear subject and verb.|Viết ba câu, mỗi câu có chủ ngữ và động từ rõ ràng.
Join two contrasting ideas with although.|Nối hai ý tương phản bằng “although”.
Write two sentences using although in different positions.|Viết hai câu dùng “although” ở hai vị trí khác nhau.
Explain your request and the reason for it.|Trình bày điều bạn đề nghị và lý do.
Write a short email requesting a detail. Include a greeting, reason and thanks.|Viết email ngắn hỏi một thông tin. Có lời chào, lý do và lời cảm ơn.
Explain one idea, add a detail, then give an example.|Trình bày một ý, thêm chi tiết rồi đưa ví dụ.
Write a four-sentence paragraph with one main idea and a relevant example.|Viết đoạn văn bốn câu với một ý chính và ví dụ phù hợp.
Read a draft aloud and explain one revision.|Đọc bản nháp thành tiếng và giải thích một chỗ bạn sửa.
Draft three sentences, then revise repeated words that add no meaning.|Viết nháp ba câu, rồi sửa những từ lặp lại không bổ sung ý nghĩa.
Describe a gradual change you have noticed.|Mô tả một thay đổi diễn ra dần dần mà bạn nhận thấy.
Write two sentences about a change over time. Include a start, an end and a time period.|Viết hai câu về sự thay đổi theo thời gian, có điểm đầu, điểm cuối và khoảng thời gian.
Restate a main point and suggest a next step.|Nhắc lại ý chính và gợi ý bước tiếp theo.
Write a two-sentence conclusion to a paragraph about a useful study routine.|Viết kết luận hai câu cho đoạn văn nói về một thói quen học tập hữu ích.
Say important slowly, then in an important question. Notice the stronger middle syllable.|Đọc chậm “important”, rồi đọc cụm “an important question”. Chú ý âm tiết giữa được nhấn mạnh.
Write two short phrases containing important, then read them aloud.|Viết hai cụm ngắn có từ “important”, rồi đọc thành tiếng.
Say worked, helped and watched with a short final t sound. Record and compare if helpful.|Đọc “worked”, “helped”, “watched” với âm /t/ ngắn ở cuối. Bạn có thể ghi âm để so sánh.
Write a sentence with worked and mark the ending you want to hear.|Viết một câu có “worked” và đánh dấu âm cuối cần chú ý.
Alternate ship and sheep slowly. Say The ship is leaving and The sheep is sleeping.|Đọc luân phiên “ship” và “sheep” thật chậm. Sau đó đọc “The ship is leaving” và “The sheep is sleeping”.
Write two short sentences, one with ship and one with sheep.|Viết hai câu ngắn, một câu có “ship” và một câu có “sheep”.
Say After the meeting, we can talk. Pause between the meaning groups.|Đọc “After the meeting, we can talk”. Ngắt nhẹ giữa các cụm nghĩa.
Write a sentence and use a slash to mark a natural pause.|Viết một câu và dùng dấu gạch chéo để đánh dấu chỗ ngắt tự nhiên.
Say an apple slowly, then smoothly. Keep the words understandable as you link them.|Đọc chậm “an apple”, rồi đọc liền mạch. Nối âm nhưng vẫn giữ rõ từ.
Write three short phrases beginning with an and read them aloud.|Viết ba cụm ngắn bắt đầu bằng “an” và đọc thành tiếng.
Ask Are you ready in two ways: a friendly check and a surprised question. Notice the difference.|Hỏi “Are you ready” theo hai cách: hỏi thân thiện và hỏi ngạc nhiên. Chú ý sự khác nhau.
Write a question and describe the attitude you want your voice to express.|Viết một câu hỏi và mô tả thái độ bạn muốn thể hiện qua giọng nói.
Record a sentence, replay it and choose one feature to practise. Try again at a comfortable speed.|Ghi âm một câu, nghe lại và chọn một điểm để luyện. Thử lại ở tốc độ thoải mái.
Write the sentence you practised and one specific observation about clarity.|Viết câu bạn đã luyện và một nhận xét cụ thể về độ rõ ràng.
`.trim().split('\n').map(line=>line.split('|'))));
Object.assign(vietnamese,{
 'Username or password is incorrect.':'Tên đăng nhập hoặc mật khẩu chưa đúng.',
 'Family login is already activated. Sign in instead.':'Tài khoản đã được kích hoạt. Hãy đăng nhập.',
 'Family login has not been activated. Open your private activation link.':'Chưa kích hoạt tài khoản. Hãy mở liên kết kích hoạt riêng của bạn.',
 'Too many attempts. Try again in 15 minutes.':'Bạn đã thử quá nhiều lần. Hãy thử lại sau 15 phút.',
 'This activation link is not valid.':'Liên kết kích hoạt không hợp lệ.',
 'Use a 3–40 character username and a password of 12–128 characters.':'Tên đăng nhập cần 3–40 ký tự và mật khẩu cần 12–128 ký tự.',
 'Please sign in again.':'Vui lòng đăng nhập lại.',
 'Please reload and try again.':'Vui lòng tải lại trang và thử lại.',
 'Enter your current password and a new password of 12–128 characters.':'Nhập mật khẩu hiện tại và mật khẩu mới dài 12–128 ký tự.',
 'Current password is incorrect.':'Mật khẩu hiện tại chưa đúng.',
 'Request origin is not allowed.':'Nguồn yêu cầu không được phép.',
 'Invalid request.':'Yêu cầu không hợp lệ.',
 'Request is too large.':'Yêu cầu quá lớn.',
 'Try again.':'Thử lại nhé.',
 'Replay the conversation or open the transcript.':'Nghe lại hội thoại hoặc mở nội dung bài nghe.',
 '✓ Correct.':'✓ Chính xác.','Correct.':'Chính xác.',
 'The answer is':'Đáp án là',
 'Sun':'CN','Mon':'Th 2','Tue':'Th 3','Wed':'Th 4','Thu':'Th 5','Fri':'Th 6','Sat':'Th 7'
});

Object.assign(vietnamese,{'ready to review':'từ đến hạn ôn','Main navigation':'Điều hướng chính','A child practising first words with a parent at a sunny table':'Một em nhỏ học từ đầu tiên cùng phụ huynh bên bàn ngập nắng','Two students collaborating in a bright library':'Hai học sinh cùng học trong thư viện sáng sủa','A learner reading with headphones beside a sunny window':'Người học đeo tai nghe đọc sách bên cửa sổ đầy nắng','A learner writing in a notebook at a warm, tidy desk':'Người học viết vào vở trên bàn gọn gàng, ấm áp','A teacher guiding a small group of students':'Giáo viên hướng dẫn một nhóm học sinh','A developer working in a bright workspace':'Lập trình viên làm việc trong không gian sáng sủa','Two people enjoying a conversation at an outdoor café':'Hai người trò chuyện tại quán cà phê ngoài trời','Two colleagues discussing a project together':'Hai đồng nghiệp thảo luận dự án','A traveller exploring a sunny coastal town':'Du khách khám phá thị trấn ven biển đầy nắng','Two people enjoying a relaxed conversation at a café':'Hai người trò chuyện thoải mái tại quán cà phê'});

Object.assign(vietnamese,{'Choose your language.':'Chọn ngôn ngữ của bạn.','Use the interface that feels natural to you.':'Chọn ngôn ngữ giao diện bạn thấy thoải mái.','Close language settings':'Đóng cài đặt ngôn ngữ','English exercises stay in English. Your language choice is saved automatically.':'Bài luyện tiếng Anh vẫn giữ nguyên tiếng Anh. Lựa chọn ngôn ngữ của bạn được lưu tự động.'});
Object.assign(vietnamese,{
'YOUR OWN LEARNING SPACE':'KHÔNG GIAN HỌC CỦA RIÊNG BẠN',
'Make English yours.':'Biến tiếng Anh thành của bạn.',
'Create an account. Your saved plans and progress will be private.':'Tạo tài khoản. Lộ trình đã lưu và tiến độ của bạn sẽ được giữ riêng tư.',
'Create account →':'Tạo tài khoản →',
'Already have an account? Sign in':'Đã có tài khoản? Đăng nhập',
'New here? Create an account':'Lần đầu sử dụng? Tạo tài khoản',
'Creating your private account…':'Đang tạo tài khoản riêng của bạn…',
'Your account. Your plans. Your progress. Saved privately and available when you sign in on another device.':'Tài khoản, lộ trình và tiến độ của riêng bạn. Dữ liệu được lưu riêng tư và có thể truy cập khi đăng nhập trên thiết bị khác.',
'That username is unavailable. Choose another one.':'Tên đăng nhập này không khả dụng. Vui lòng chọn tên khác.',
'This workspace belongs to a different account.':'Không gian học này thuộc tài khoản khác.',
'Invalid workspace.':'Dữ liệu học không hợp lệ.',
'Your progress changed on another device. Export your work before reloading.':'Tiến độ đã thay đổi trên thiết bị khác. Hãy xuất bản sao lưu trước khi tải lại.',
'Saved privately':'Đã lưu riêng tư',
'Saving…':'Đang lưu…',
'Not saved — retry':'Chưa lưu — thử lại',
'Changes need review':'Cần kiểm tra thay đổi',
'Account sync status':'Trạng thái đồng bộ tài khoản',
'My saved plans':'Lộ trình đã lưu',
'✓ Saved plan':'✓ Đã lưu lộ trình',
'Save plan':'Lưu lộ trình',
'Your writing and progress are saved privately to your account.':'Bài viết và tiến độ được lưu riêng tư vào tài khoản của bạn.',
'Progress saved privately to your account':'Tiến độ được lưu riêng tư trong tài khoản',
'Could not save your progress. Export a backup from Preferences.':'Không thể lưu tiến độ. Hãy xuất bản sao lưu trong Cài đặt.',
'Could not save your progress. Please try again.':'Không thể lưu tiến độ. Vui lòng thử lại.',
'Could not load your account data. Please try again.':'Không tải được dữ liệu tài khoản. Vui lòng thử lại.',
'Your account data is unavailable.':'Chưa tải được dữ liệu tài khoản.',
'Could not load your account data. Nothing has been overwritten.':'Không tải được dữ liệu tài khoản. Chưa có dữ liệu nào bị ghi đè.',
'Reload account data':'Tải lại dữ liệu tài khoản',
'Backup restored. Saving to your account…':'Đã khôi phục bản sao lưu. Đang lưu vào tài khoản…',
'Use 12–128 characters. Changing the password signs out every device. Your saved learning progress stays in your account.':'Dùng 12–128 ký tự. Đổi mật khẩu sẽ đăng xuất tài khoản này trên mọi thiết bị. Tiến độ vẫn được giữ trong tài khoản.'
});

Object.assign(vietnamese,{'No saved plans yet.':'Bạn chưa lưu lộ trình nào.','Choose Save plan on any path to keep it in your private list.':'Nhấn Lưu lộ trình ở lộ trình bạn thích để thêm vào danh sách riêng.'});

Object.assign(vietnamese,{'Use 3–40 letters, numbers, dots, underscores or hyphens. No spaces.':'Dùng 3–40 ký tự gồm chữ cái tiếng Anh, số, dấu chấm, gạch dưới hoặc gạch ngang. Không dùng khoảng trắng.'});
