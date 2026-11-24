(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const fields = {
    year: $("ikasturtea"),
    price: $("prezioa"),
    quantity: $("kopurua"),
    start: $("hasiera")
  };

  function currentSchoolYear() {
    const now = new Date();
    const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}/${startYear + 1}`;
  }

  fields.year.value = currentSchoolYear();

  function formatNumber(n) {
    return String(n).padStart(4, "0");
  }

  function pagesNeeded(quantity) {
    // Jatorrizko Python kodea bezala: 100 zenbakiko lote bakoitzeko 10 aurrealde-orri.
    const frontPages = Math.ceil(quantity / 100) * 10;
    return frontPages * 2; // aurrealdea + atzealdea
  }

  function updateSummary() {
    const q = Math.max(0, Math.floor(Number(fields.quantity.value) || 0));
    const start = Math.max(0, Math.floor(Number(fields.start.value) || 0));
    const price = Math.max(0, Number(fields.price.value) || 0);
    $("lehen-zenbakia").textContent = formatNumber(start);
    $("azken-zenbakia").textContent = formatNumber(q ? start + q - 1 : start);
    $("diru-bilketa").textContent = (q * price).toLocaleString("eu-ES", {
      style: "currency", currency: "EUR"
    });
    $("orrialdeak").textContent = q ? String(pagesNeeded(q)) : "0";
  }

  Object.values(fields).forEach((field) => field.addEventListener("input", updateSummary));
  updateSummary();

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Ezin izan da irudia kargatu: ${src}`));
      image.src = src;
    });
  }

  function addTicket(pdf, image, x, y, w, h, side, number, price, year) {
    // Txartelaren diseinua dagokion laukian sartzen da. Aspect ratio pixka bat doitzen da
    // jatorrizko 2 zutabe x 5 errenkadako A4 banaketarekin bat etortzeko.
    pdf.addImage(image, "PNG", x, y, w, h, undefined, "FAST");

    const sx = w / 1240;
    const sy = h / 877;

    if (side === "front") {
      // Prezio zaharra estali, markoaren ertzak mantenduz, eta prezio berria idatzi.
      pdf.setFillColor(255, 255, 255);
      pdf.rect(x + 755*sx, y + 255*sy, 395*sx, 125*sy, "F");
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(25);
      pdf.text(`${price} €`, x + 950*sx, y + 352*sy, { align:"center" });

      // Aurreko adibideko 0001 zenbakia estali eta zenbaki berria idatzi.
      pdf.setFillColor(255, 255, 255);
      pdf.rect(x + 1050*sx, y + 795*sy, 180*sx, 75*sy, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(15);
      pdf.text(formatNumber(number), x + 1185*sx, y + 852*sy, { align:"right" });
    } else {
      // Atzealdeko diseinuan dagoen ikasturte zaharra estali eta berria idatzi.
      pdf.setFillColor(180, 180, 180);
      pdf.rect(x + 65*sx, y + 300*sy, 445*sx, 155*sy, "F");
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(25);
      pdf.text(year, x + 80*sx, y + 420*sy);
    }
  }

  async function generatePdf({ quantity, start, price, year }) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("PDF sortzeko liburutegia ezin izan da kargatu. Egiaztatu Interneteko konexioa.");
    }

    const [frontImage, backImage] = await Promise.all([
      loadImage("img/aurrealdea.png"),
      loadImage("img/atzealdea.png")
    ]);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4", compress:true });
    const pageW = 210;
    const pageH = 297;
    const ticketW = pageW / 2;
    const ticketH = pageH / 5;
    const last = start + quantity - 1;

    let currentBatchStart = start;
    let isFirstPage = true;

    // Jatorrizko Python kodeko batch_size=10 eta row*20 + col*10 formula bera.
    while (currentBatchStart <= last) {
      for (let offset = 0; offset < 10; offset++) {
        if (currentBatchStart + offset > last) break;

        if (!isFirstPage) pdf.addPage("a4", "portrait");
        isFirstPage = false;

        for (let position = 0; position < 10; position++) {
          const row = Math.floor(position / 2);
          const col = position % 2;
          const number = currentBatchStart + offset + row * 20 + col * 10;
          const x = col * ticketW;
          const y = row * ticketH;
          if (number <= last) {
            addTicket(pdf, frontImage, x, y, ticketW, ticketH, "front", number, price, year);
          } else {
            // Kopurua 100eko lotea baino txikiagoa bada, hutsik utzi gainerako laukia.
            pdf.setFillColor(255,255,255);
            pdf.rect(x,y,ticketW,ticketH,"F");
          }
        }

        // Python jatorrizko sisteman bezala, aurrealde-orri bakoitzaren ondoren atzealdea.
        pdf.addPage("a4", "portrait");
        for (let position = 0; position < 10; position++) {
          const row = Math.floor(position / 2);
          const col = position % 2;
          addTicket(pdf, backImage, col * ticketW, row * ticketH, ticketW, ticketH, "back", 0, price, year);
        }
      }
      currentBatchStart += 100;
    }

    const filename = `rifak_${formatNumber(start)}-${formatNumber(last)}.pdf`;
    pdf.save(filename);
  }

  $("rifa-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = $("errorea");
    error.hidden = true;

    const quantity = Number(fields.quantity.value);
    const start = Number(fields.start.value);
    const price = Number(fields.price.value);
    const year = fields.year.value.trim();

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
      error.textContent = "Rifen kopuruak 1 eta 100.000 artean egon behar du.";
      error.hidden = false; return;
    }
    if (!Number.isInteger(start) || start < 0 || start + quantity - 1 > 999999) {
      error.textContent = "Hasierako zenbakia edo azken zenbakia ez da balioduna (gehienez 999999).";
      error.hidden = false; return;
    }
    if (!Number.isFinite(price) || price < 0 || price > 9999) {
      error.textContent = "Prezioak 0 eta 9999 euro artean egon behar du.";
      error.hidden = false; return;
    }
    if (!year || year.length > 20) {
      error.textContent = "Idatzi ikasturte baliodun bat.";
      error.hidden = false; return;
    }

    const button = $("sortu");
    button.disabled = true;
    $("button-label").textContent = "PDFa prestatzen...";
    $("spinner").hidden = false;

    try {
      await generatePdf({ quantity, start, price, year });
    } catch (err) {
      error.textContent = err.message || "Errorea gertatu da PDFa sortzean.";
      error.hidden = false;
    } finally {
      button.disabled = false;
      $("button-label").textContent = "PDFa sortu eta deskargatu";
      $("spinner").hidden = true;
    }
  });
})();
