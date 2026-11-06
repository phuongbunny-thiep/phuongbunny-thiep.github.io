/* =====================================================================
   THÔNG TIN THIỆP — mỗi đơn chỉ cần sửa file này + thay ảnh trong assets/
   (Không cần đụng vào index.html)
   ===================================================================== */
window.CONFIG = {
  // "nha-gai" = thiệp nhà gái (Lễ Vu Quy) · "nha-trai" = thiệp nhà trai (Lễ Thành Hôn)
  side: "nha-gai",

  bride: { name: "Thu Hà",   fullName: "Nguyễn Thu Hà",  order: "Trưởng nữ", photo: "assets/anh/co-dau.jpg" },
  groom: { name: "Minh Anh", fullName: "Trần Minh Anh",  order: "Thứ nam",   photo: "assets/anh/chu-re.jpg" },

  brideFamily: {
    father: "Ông Nguyễn Văn Bình",
    mother: "Bà Lê Thị Hoa",
    address: "Số 12 ngõ 45 Hào Nam, Đống Đa, Hà Nội"
  },
  groomFamily: {
    father: "Ông Trần Đức Minh",
    mother: "Bà Phạm Thị Lan",
    address: "Số 8 Nguyễn Trãi, Thanh Xuân, Hà Nội"
  },

  // Mốc chính: dùng cho lịch tháng (khoanh tim) và đồng hồ đếm ngược
  mainDate: "2027-01-10T08:00:00+07:00",

  // Các sự kiện. Âm lịch tự tính theo giờ Việt Nam; muốn ghi tay thì điền "lunar".
  events: [
    {
      title: "Tiệc cưới nhà gái",
      datetime: "2027-01-09T17:30:00+07:00",
      venue: "Nhà hàng Hoa Sen",
      address: "Số 1 Láng Hạ, Ba Đình, Hà Nội",
      map: ""        // link Google Maps (để trống sẽ tự tìm theo địa chỉ)
    },
    {
      title: "Lễ Vu Quy",
      datetime: "2027-01-10T08:00:00+07:00",
      venue: "Tại tư gia nhà gái",
      address: "Số 12 ngõ 45 Hào Nam, Đống Đa, Hà Nội",
      map: ""
    }
  ],
  // Bản đồ nhúng hiển thị địa điểm nào (số thứ tự trong events, bắt đầu từ 0)
  mapEvent: 0,

  // Phần mở đầu
  background: "",                 // ảnh nền phần mở đầu (để trống = nền đỏ đô kẻ sọc)
  envelopeText: "Trân trọng<br>kính mời",
  monogram: "",                   // chữ trên dấu sáp, để trống = tự lấy chữ cái đầu
  envelopePhotos: ["assets/anh/anh-1.jpg", "assets/anh/anh-2.jpg"],
  photosBlackWhite: true,

  invitation: "",                 // để trống = tự ghi theo nhà gái / nhà trai
  quote: "Hai trái tim, một lời hẹn ước — cùng nhau đi hết những tháng năm dài.",

  album: [
    "assets/anh/anh-1.jpg", "assets/anh/anh-2.jpg", "assets/anh/anh-3.jpg",
    "assets/anh/anh-4.jpg", "assets/anh/anh-5.jpg", "assets/anh/anh-6.jpg"
  ],

  // Hộp mừng cưới — ảnh QR lấy từ app ngân hàng
  gifts: [
    { label: "Mừng cưới cô dâu", bank: "Vietcombank", number: "0123 456 789", holder: "NGUYEN THU HA", qr: "assets/qr-co-dau.png" },
    { label: "Mừng cưới chú rể", bank: "Techcombank", number: "1903 2222 8888", holder: "TRAN MINH ANH", qr: "assets/qr-chu-re.png" }
  ],

  // Xác nhận tham dự: dán link Web App của Google Apps Script (xem apps-script/Code.gs)
  // Để trống = chế độ demo (form vẫn chạy nhưng không lưu đi đâu)
  rsvpEndpoint: "",
  sampleWishes: [
    { name: "Lan Anh", message: "Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui nhé!" },
    { name: "Anh Tuấn", message: "Chúc mừng hạnh phúc! Hẹn gặp ở tiệc cưới." },
    { name: "Nhóm lớp 12A1", message: "Cô dâu xinh nhất hệ mặt trời. Chúc mừng Hà và Minh Anh!" }
  ],

  thanks: "Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi.",
  thanksPhoto: "assets/anh/cam-on.jpg",

  music: "",          // "assets/nhac.mp3" — phát khi khách mở thiệp
  petals: true,       // cánh hoa rơi nhẹ sau khi mở thiệp
  credit: "phuongbunnie.id.vn"
};
// Tên khách mời qua link: ...?khach=Anh%20Tuấn  → phong bì ghi "Kính gửi Anh Tuấn"
