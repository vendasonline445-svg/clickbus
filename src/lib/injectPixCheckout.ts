const PIX_STYLE_ID = 'lovable-pix-style';
const PIX_SCRIPT_ID = 'lovable-pix-script';

interface PixCheckoutConfig {
  edgeFunctionUrl: string;
  supabaseAnonKey: string;
}

const STYLE_BLOCK = `
<style id="${PIX_STYLE_ID}">
  .lovable-pix-overlay {
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.64);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 999999;
  }
  .lovable-pix-overlay.is-open { display: flex; }
  .lovable-pix-modal {
    width: min(92vw, 680px);
    max-height: 92vh;
    overflow: auto;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 30px 100px rgba(0,0,0,.24);
    padding: 28px;
    font-family: inherit;
    color: #222;
  }
  .lovable-pix-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0,0,0,.12);
  }
  .lovable-pix-title { margin: 0; font-size: 2rem; line-height: 1.1; font-weight: 800; }
  .lovable-pix-close {
    border: 0;
    background: transparent;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: #666;
  }
  .lovable-pix-copy {
    display: flex;
    gap: 12px;
    align-items: center;
    background: #f6f1cc;
    padding: 14px;
    border-radius: 16px;
    margin-top: 10px;
  }
  .lovable-pix-copy code {
    flex: 1;
    white-space: nowrap;
    overflow: auto;
    font-size: 14px;
    background: transparent;
    color: #222;
  }
  .lovable-pix-copy-btn {
    border: 0;
    cursor: pointer;
    border-radius: 999px;
    padding: 12px 18px;
    font-weight: 700;
    background: #ff9800;
    color: white;
  }
  .lovable-pix-qr-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
  }
  .lovable-pix-qr {
    width: 220px;
    height: 220px;
    border: 1px solid rgba(0,0,0,.14);
    border-radius: 18px;
    object-fit: contain;
    background: white;
    padding: 8px;
  }
  .lovable-pix-note, .lovable-pix-error, .lovable-pix-success, .lovable-pix-timer {
    border-radius: 14px;
    padding: 14px 16px;
    margin-top: 16px;
    text-align: center;
    font-weight: 600;
  }
  .lovable-pix-note { background: #f8f8f8; color: #444; }
  .lovable-pix-timer { background: #fff4e5; color: #ff8a00; }
  .lovable-pix-error { background: #fde8e8; color: #d92d20; display: none; }
  .lovable-pix-success { background: #e8f7ee; color: #067647; display: none; }
  @media (max-width: 640px) {
    .lovable-pix-modal { padding: 20px; border-radius: 20px; }
    .lovable-pix-title { font-size: 1.6rem; }
    .lovable-pix-copy { flex-direction: column; align-items: stretch; }
  }
</style>`;

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function serializeDocument(doc: Document, originalHtml: string) {
  const hasDoctype = /^\s*<!doctype html>/i.test(originalHtml);
  return `${hasDoctype ? '<!DOCTYPE html>\n' : ''}${doc.documentElement.outerHTML}`;
}

function stripCurrentPixInjection(html: string) {
  return html
    .replace(new RegExp(`<style[^>]*id=["']${PIX_STYLE_ID}["'][\\s\\S]*?<\\/style>`, 'i'), '')
    .replace(new RegExp(`<script[^>]*id=["']${PIX_SCRIPT_ID}["'][\\s\\S]*?<\\/script>`, 'i'), '');
}

function removeLegacyPixMarkup(html: string) {
  if (typeof DOMParser === 'undefined') {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const legacyMarkers = ['Finalizar Doação', 'Valor da Doação', 'Nome Completo', 'Gerar PIX'];
  const candidates = Array.from(doc.body.querySelectorAll('div, section, aside, dialog, form')).filter((node) => {
    const text = normalizeText(node.textContent || '');
    return legacyMarkers.every((marker) => text.includes(marker));
  });

  const smallestCandidates = candidates.filter((node) => !candidates.some((other) => other !== node && node.contains(other)));
  smallestCandidates.forEach((node) => node.remove());

  Array.from(doc.querySelectorAll('script')).forEach((script) => {
    const text = script.textContent || '';
    if (/Finalizar Doação|Valor da Doação|Nome Completo|000\.000\.000-00|Gerar PIX/i.test(text)) {
      script.remove();
    }
  });

  return serializeDocument(doc, html);
}

export function normalizePixCheckoutHtml(html: string) {
  return stripCurrentPixInjection(removeLegacyPixMarkup(html));
}

function buildScript(config: PixCheckoutConfig) {
  return `
<script id="${PIX_SCRIPT_ID}">
(function() {
  if (window.__LOVABLE_PIX_ACTIVE__) return;
  window.__LOVABLE_PIX_ACTIVE__ = true;

  const config = ${JSON.stringify(config)};
  const triggerRegex = /(comprar|quero comprar|pagar|pix|doar|doação|contribuir|apoiar|assinar|checkout|finalizar)/i;

  function normalizeText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function extractPrice(target) {
    const searchRoot = target.closest('section, article, div, li, form') || document.body;
    const text = normalizeText(searchRoot.innerText || target.innerText || '');
    const match = text.match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})|\d+(?:,\d{2})?)/);
    if (!match) return '';
    return match[1].replace(/\./g, '').replace(',', '.');
  }

  function getOrCreateModal() {
    let overlay = document.querySelector('.lovable-pix-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.className = 'lovable-pix-overlay';
    overlay.innerHTML = \
      '<div class="lovable-pix-modal" role="dialog" aria-modal="true" aria-label="Pagamento via PIX">' +
        '<div class="lovable-pix-header">' +
          '<h2 class="lovable-pix-title">Pagamento via PIX</h2>' +
          '<button type="button" class="lovable-pix-close" aria-label="Fechar">×</button>' +
        '</div>' +
        '<p class="lovable-pix-note">Gerando seu código PIX...</p>' +
        '<div class="lovable-pix-success"></div>' +
        '<div class="lovable-pix-error"></div>' +
        '<div class="lovable-pix-result" style="display:none">' +
          '<div class="lovable-pix-qr-wrap">' +
            '<img class="lovable-pix-qr" alt="QR Code PIX" />' +
            '<div style="font-size:14px;color:#555">Escaneie o QR Code ou copie o código abaixo.</div>' +
          '</div>' +
          '<div class="lovable-pix-copy"><code></code><button type="button" class="lovable-pix-copy-btn">Copiar</button></div>' +
          '<div class="lovable-pix-timer">Tempo restante: <span>30:00</span></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(event) {
      if (event.target === overlay || event.target.closest('.lovable-pix-close')) {
        overlay.classList.remove('is-open');
      }
    });

    const copyBtn = overlay.querySelector('.lovable-pix-copy-btn');
    copyBtn.addEventListener('click', async function() {
      const code = overlay.querySelector('.lovable-pix-copy code').textContent || '';
      if (!code) return;
      await navigator.clipboard.writeText(code);
      const successBox = overlay.querySelector('.lovable-pix-success');
      successBox.textContent = 'Código PIX copiado com sucesso.';
      successBox.style.display = 'block';
    });

    return overlay;
  }

  async function generatePix(overlay, amount) {
    const noteBox = overlay.querySelector('.lovable-pix-note');
    const errorBox = overlay.querySelector('.lovable-pix-error');
    const successBox = overlay.querySelector('.lovable-pix-success');
    const resultBox = overlay.querySelector('.lovable-pix-result');
    const qr = overlay.querySelector('.lovable-pix-qr');
    const codeEl = overlay.querySelector('.lovable-pix-copy code');

    errorBox.style.display = 'none';
    successBox.style.display = 'none';
    resultBox.style.display = 'none';
    noteBox.textContent = 'Gerando PIX de R$ ' + amount.toFixed(2).replace('.', ',') + '...';

    try {
      const response = await fetch(config.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + config.supabaseAnonKey,
          'apikey': config.supabaseAnonKey,
        },
        body: JSON.stringify({
          amount,
          description: document.title || 'Pagamento via PIX',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.pix_code) {
        throw new Error(data.error || 'Falha ao gerar PIX.');
      }

      codeEl.textContent = data.pix_code;
      qr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(data.pix_code);
      resultBox.style.display = 'block';
      noteBox.textContent = 'PIX gerado com sucesso.';
      successBox.textContent = 'Código pronto para pagamento.';
      successBox.style.display = 'block';

      let remaining = 1800;
      const timerEl = overlay.querySelector('.lovable-pix-timer span');
      clearInterval(window.__LOVABLE_PIX_TIMER__);
      window.__LOVABLE_PIX_TIMER__ = setInterval(function() {
        remaining -= 1;
        const minutes = String(Math.max(0, Math.floor(remaining / 60))).padStart(2, '0');
        const seconds = String(Math.max(0, remaining % 60)).padStart(2, '0');
        timerEl.textContent = minutes + ':' + seconds;
        if (remaining <= 0) clearInterval(window.__LOVABLE_PIX_TIMER__);
      }, 1000);
    } catch (error) {
      noteBox.textContent = 'Não foi possível gerar o PIX.';
      errorBox.textContent = error && error.message ? error.message : 'Erro ao gerar PIX.';
      errorBox.style.display = 'block';
    }
  }

  function shouldIntercept(target) {
    if (!target) return false;
    const clickable = target.closest('button, a, [role="button"], input[type="button"], input[type="submit"]');
    if (!clickable) return false;
    const text = normalizeText(clickable.innerText || clickable.value || clickable.getAttribute('aria-label') || '');
    return triggerRegex.test(text);
  }

  document.addEventListener('click', function(event) {
    const target = event.target;
    if (!shouldIntercept(target)) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    const clickable = target.closest('button, a, [role="button"], input[type="button"], input[type="submit"]');
    const overlay = getOrCreateModal();
    const guessedPrice = Number(extractPrice(clickable) || '50');
    overlay.classList.add('is-open');
    generatePix(overlay, guessedPrice > 0 ? guessedPrice : 50);
  }, true);
})();
</script>`;
}

function upsertBeforeClosingTag(html: string, closingTag: string, content: string) {
  const pattern = new RegExp(closingTag, 'i');
  if (pattern.test(html)) {
    return html.replace(pattern, `${content}\n${closingTag}`);
  }
  return `${html}\n${content}`;
}

export function injectPixCheckout(html: string, config: PixCheckoutConfig) {
  const cleanedHtml = normalizePixCheckoutHtml(html);
  const withStyle = upsertBeforeClosingTag(cleanedHtml, '</head>', STYLE_BLOCK);
  return upsertBeforeClosingTag(withStyle, '</body>', buildScript(config));
}
