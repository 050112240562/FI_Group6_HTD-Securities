/* HTD Stock Center: new-tab report links and prompt builder. No AI API calls. */
(function () {
  'use strict';
  let lastFocus = null;
  let promptTicker = '', promptName = '';
  const $ = id => document.getElementById(id);
  const todayVN = () => {
    const parts = new Intl.DateTimeFormat('en', {timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const part = type => parts.find(p => p.type === type).value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  };
  function pool() { return typeof allCards !== 'undefined' ? allCards : []; }
  function normaliseTicker(value) { return String(value).trim().toUpperCase(); }
  function isValidTicker(value) { return /^[A-Z][A-Z0-9]{1,5}$/.test(value); }
  function buildPrompt(ticker, companyName, cutoff, lang) {
    const company = companyName ? `Tên doanh nghiệp do người dùng cung cấp: ${companyName}. Hãy xác minh tên và sàn trước khi phân tích.` : 'Chưa xác nhận tên doanh nghiệp. Hãy xác minh chính xác mã, doanh nghiệp và sàn giao dịch trước khi phân tích.';
    const language = lang === 'en' ? 'Viết báo cáo bằng tiếng Anh, dùng thuật ngữ tài chính rõ ràng.' : 'Viết báo cáo bằng tiếng Việt, dùng thuật ngữ tài chính rõ ràng.';
    return `Hãy đóng vai chuyên viên phân tích cổ phiếu Việt Nam và tạo báo cáo về mã ${ticker} theo cấu trúc HTD SECURITIES dưới đây. Bật tìm kiếm web để truy xuất, đọc và đối chiếu nguồn thực tế.

MÃ YÊU CẦU: ${ticker}
${company}
NGÀY CHỐT PHÂN TÍCH: ${cutoff} (múi giờ Việt Nam).
${language}

QUY TẮC DỮ LIỆU BẮT BUỘC
1. Xác minh mã, tên pháp lý, sàn và ngành. Nếu mã không tồn tại, trùng hoặc không xác định được, dừng và hỏi lại; không tự đổi sang mã khác.
2. Chỉ dùng thông tin được công bố không muộn hơn ngày chốt. Ưu tiên BCTC, báo cáo thường niên và công bố của doanh nghiệp/sở giao dịch; dùng Vietstock, nguồn dữ liệu chứng khoán hoặc báo cáo CTCK để đối chiếu. Không coi ngày kết thúc kỳ kế toán là ngày thông tin đã được công bố.
3. Mọi bảng phải ghi đơn vị, kỳ tài chính, ngày công bố/ngày dữ liệu và đường dẫn nguồn gần bảng. Mở và đọc nguồn; không bịa URL, trích dẫn hoặc số liệu. Nếu không truy cập được nguồn, nói rõ phần chưa kiểm chứng.
4. Lấy giá đóng cửa phiên gần nhất không sau ngày chốt; ghi ngày giá. Xác định cơ sở điều chỉnh giá và số cổ phiếu tương ứng trước khi tính vốn hóa, EPS, P/E, P/B. Không trộn giá sau chia tách với EPS trước chia tách.
5. Tách số thực tế (A), dự phóng từ nguồn (F) và ước tính tự xây dựng. Không tạo dự phóng nếu không có nguồn hoặc giả định minh bạch. Phân biệt LNST hợp nhất và LNST thuộc cổ đông công ty mẹ; dùng tử số/mẫu số nhất quán khi tính EPS, ROA và ROE. Nêu rõ ROA/ROE dùng tài sản/vốn chủ bình quân hay cuối kỳ.
6. Không trộn số quý, lũy kế và cả năm. P/E ưu tiên EPS TTM có thể kiểm tra; nếu dùng EPS dự phóng thì ghi P/E forward. EPS không dương thì ghi P/E không có ý nghĩa thay vì diễn giải P/E âm như cổ phiếu rẻ. Không tự nhân 4 số một quý để coi là kết quả cả năm.
7. Thiếu dữ liệu thì ghi N/A và liệt kê phần thiếu. Không suy đoán số từ biểu đồ. Phân biệt sự kiện đã xảy ra, diễn giải của người viết và tham vọng chưa hoàn thành của doanh nghiệp.

BỐ CỤC BÁO CÁO HTD
A. Tóm tắt đầu trang: tên doanh nghiệp, mã/sàn/ngành; ngày giá; giá tham chiếu; vốn hóa; doanh thu kỳ gần nhất; EPS và P/E với đúng cơ sở kỳ. Thêm bảng DATA CHECK ngắn cho mục chưa xác minh.
B. Vị thế thị trường: sản phẩm, khách hàng, đối thủ, lợi thế và các giới hạn cạnh tranh có bằng chứng.
C. Mô hình kinh doanh: doanh nghiệp kiếm tiền bằng cách nào, phân khúc và động lực doanh thu/lợi nhuận.
D. Kết quả tài chính: tối đa 5 năm thực tế gần nhất đã công bố và kỳ cập nhật mới nhất. Trình bày doanh thu, LNST hợp nhất, LNST cổ đông mẹ, biên lợi nhuận, EPS, ROA, ROE. Bảng phụ gồm thanh khoản, cơ cấu nguồn vốn và dòng tiền. Nếu là ngân hàng, chứng khoán hoặc bảo hiểm, thay chỉ tiêu bán lẻ bằng chỉ tiêu phù hợp ngành và giải thích.
E. Câu chuyện doanh nghiệp: 3-4 giai đoạn, mỗi giai đoạn nối một sự kiện kinh doanh với một số liệu tài chính. Không nhầm biến động giá cổ phiếu với thay đổi hoạt động kinh doanh.
F. Triển vọng: chất xúc tác, giả định cần đạt, rủi ro thực thi; tách rõ dự phóng và thực tế.
G. Rủi ro: phân tích kinh doanh, tài chính, định giá và chất lượng dữ liệu. Không mặc định cổ phiếu phù hợp với khẩu vị của mọi nhà đầu tư.
H. Góc nhìn định giá: nêu phương pháp, kỳ số liệu và giới hạn so sánh. Nếu trích giá mục tiêu CTCK, ghi ngày báo cáo, cơ sở cổ phiếu và nguồn. Chỉ kết luận đắt/rẻ khi có cơ sở; không hứa lợi nhuận.
I. Kết luận: luận điểm chính, điểm phản biện mạnh nhất, điều kiện khiến luận điểm thay đổi và thời gian theo dõi phù hợp có giải thích.

ĐẦU RA
- Trước hết kiểm tra dữ liệu. Nếu thiếu thông tin trọng yếu, trả báo cáo một phần có chỉ rõ giới hạn, không tự hoàn thiện bằng số giả.
- Viết thành báo cáo dễ đọc, ưu tiên bảng và đoạn ngắn; bảng/biểu đồ phải có nguồn.
- Kèm bảng dữ liệu dùng để vẽ: doanh thu, lợi nhuận, ROA/ROE và EPS; không vẽ khi thiếu dữ liệu.
- Cuối cùng đề xuất bản tóm tắt 1-3 trang theo phong cách HTD: navy, vàng, nền sáng, thứ tự giống bố cục trên. Chưa cần tạo ảnh nếu chưa kiểm tra xong các con số.
- Nêu rõ ngày giá và kỳ dữ liệu, không gọi dữ liệu lịch sử là dữ liệu trực tiếp hiện tại.`;
  }
  function showDialog(dialog) {
    lastFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('htd-dialog-open');
  }
  function closeDialog(dialog) { if (dialog.open) dialog.close(); }
  function dialogClosed() {
    if (!document.querySelector('.htd-dialog[open]')) document.body.classList.remove('htd-dialog-open');
    if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  }
  function resetPromptResult() {
    $('htdPromptResult').hidden = true; $('htdCopyStatus').textContent = '';
  }
  function updateCompany() {
    const ticker = normaliseTicker($('htdTicker').value);
    const found = pool().find(s => s.code === ticker);
    const el = $('htdCompanyStatus');
    if (found) {
      el.textContent = `${found.name} · ${found.exchange || 'Sàn chưa xác nhận'} · tên từ danh sách có sẵn`;
      $('htdCompanyName').value = found.name;
    } else {
      el.textContent = ticker ? 'Mã ngoài danh sách có sẵn. AI sẽ cần xác minh mã, tên và sàn trước khi phân tích.' : 'Nhập mã để kiểm tra tên trong danh sách có sẵn.';
      if (promptName && $('htdCompanyName').value === promptName) $('htdCompanyName').value = '';
    }
    promptName = found ? found.name : '';
    $('htdPromptError').textContent = ''; resetPromptResult();
  }
  function openPrompt() {
    $('htdPromptForm').reset();
    $('htdAsOf').value = todayVN(); $('htdAsOf').max = todayVN();
    $('htdPromptError').textContent = ''; updateCompany();
    showDialog($('htdPromptDialog')); $('htdTicker').focus();
  }
  function submitPrompt(event) {
    event.preventDefault();
    const ticker = normaliseTicker($('htdTicker').value), date = $('htdAsOf').value;
    if (!isValidTicker(ticker)) { $('htdPromptError').textContent = 'Nhập mã gồm 2-6 ký tự chữ/số, bắt đầu bằng chữ. Ví dụ: FRT, PNJ, VNM.'; $('htdTicker').focus(); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayVN()) { $('htdPromptError').textContent = 'Chọn ngày chốt hợp lệ, không sau hôm nay.'; return; }
    $('htdTicker').value = ticker;
    promptTicker = ticker;
    $('htdPromptText').value = buildPrompt(ticker, $('htdCompanyName').value.trim(), date, $('htdLanguage').value);
    $('htdPromptError').textContent = ''; $('htdPromptResult').hidden = false;
    $('htdCopyStatus').textContent = ''; $('htdPromptText').focus();
  }
  async function copyPrompt() {
    const text = $('htdPromptText').value;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('fallback');
      await navigator.clipboard.writeText(text);
      $('htdCopyStatus').textContent = 'Đã sao chép. Dán vào ChatGPT và bật tìm kiếm web.';
    } catch (_) {
      const el = $('htdPromptText'); el.focus(); el.select(); el.setSelectionRange(0, el.value.length);
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { /* manual selection remains */ }
      $('htdCopyStatus').textContent = copied ? 'Đã sao chép. Dán vào ChatGPT và bật tìm kiếm web.' : 'Đã chọn toàn bộ prompt. Nhấn Sao chép trên thiết bị hoặc tải TXT.';
    }
  }
  function downloadPrompt() {
    const blob = new Blob(['\uFEFF' + $('htdPromptText').value], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = `HTD_Prompt_${promptTicker}_${$('htdAsOf').value}.txt`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function addPromptCard() {
    const grid = $('companyGrid');
    if (!grid || grid.querySelector('.htd-add-card')) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'company-card htd-add-card';
    button.innerHTML = '<span class="htd-add-icon" aria-hidden="true">+</span><span class="cc-code">Phân tích mã khác</span><span class="cc-name">Tạo prompt theo mẫu HTD</span>';
    button.addEventListener('click', openPrompt); grid.appendChild(button);
  }
  function init() {
    if (!$('companyGrid')) return;
    const shell = document.createElement('div');
    shell.innerHTML = `
    <dialog class="htd-dialog htd-prompt-dialog" id="htdPromptDialog" aria-labelledby="htdPromptTitle">
      <div class="htd-dialog-shell"><div class="htd-dialog-header"><div><p class="htd-eyebrow">HTD RESEARCH ASSISTANT</p><h2 id="htdPromptTitle">Phân tích mã khác</h2><p>Tạo yêu cầu phân tích theo cấu trúc báo cáo HTD.</p></div><button type="button" class="htd-close" data-close="htdPromptDialog" aria-label="Đóng cửa sổ tạo prompt">×</button></div>
      <div class="htd-prompt-body"><div class="htd-howto"><b>1. Nhập mã</b><span>→</span><b>2. Tạo & sao chép prompt</b><span>→</span><b>3. Dán vào ChatGPT</b></div><p class="htd-hint">Bật tìm kiếm web trong ChatGPT để lấy và kiểm tra dữ liệu. Báo cáo được tạo trong ChatGPT; kết quả chưa tự đăng lên website.</p>
      <form id="htdPromptForm" novalidate><div class="htd-form-grid"><div><label for="htdTicker">Mã cổ phiếu</label><input id="htdTicker" name="ticker" maxlength="6" placeholder="Ví dụ: PNJ" autocomplete="off" autocapitalize="characters" spellcheck="false" required><p id="htdCompanyStatus" class="htd-hint" aria-live="polite"></p></div><div><label for="htdCompanyName">Tên doanh nghiệp (nếu biết)</label><input id="htdCompanyName" maxlength="140" placeholder="AI sẽ xác minh lại tên doanh nghiệp"></div><div><label for="htdAsOf">Ngày chốt phân tích</label><input id="htdAsOf" type="date" required></div><div><label for="htdLanguage">Ngôn ngữ báo cáo</label><select id="htdLanguage"><option value="vi">Tiếng Việt</option><option value="en">English</option></select></div></div><p id="htdPromptError" class="htd-error" role="alert"></p><button type="submit" class="htd-primary">Tạo prompt phân tích</button></form>
      <section id="htdPromptResult" hidden><label for="htdPromptText" class="htd-result-label">Prompt của bạn</label><textarea id="htdPromptText" readonly rows="12" spellcheck="false"></textarea><div class="htd-prompt-actions"><button type="button" class="htd-primary" id="htdCopyPrompt">Sao chép prompt</button><button type="button" id="htdDownloadPrompt">Tải TXT</button><a href="https://chatgpt.com/" target="_blank" rel="noopener">Mở ChatGPT ↗</a></div><p id="htdCopyStatus" role="status" aria-live="polite"></p></section>
      </div></div>
    </dialog>`;
    document.body.appendChild(shell);
    document.querySelectorAll('.htd-dialog').forEach(d => {
      d.addEventListener('close', dialogClosed);
      d.addEventListener('click', e => { if (e.target === d) closeDialog(d); });
    });
    shell.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeDialog($(b.dataset.close))));
    new MutationObserver(addPromptCard).observe($('companyGrid'), {childList:true}); addPromptCard();
    $('htdTicker').addEventListener('input', updateCompany);
    ['htdCompanyName','htdAsOf','htdLanguage'].forEach(id => $(id).addEventListener('input', resetPromptResult));
    $('htdPromptForm').addEventListener('submit', submitPrompt);
    $('htdCopyPrompt').addEventListener('click', copyPrompt);
    $('htdDownloadPrompt').addEventListener('click', downloadPrompt);
  }
  // Pure helpers are exposed for verification and future API integration.
  window.HTDStockTools = {normaliseTicker, isValidTicker, buildPrompt};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
