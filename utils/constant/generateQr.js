import QRCode from "qrcode";
const generateQR = async text => {
    try {
      const QR = await QRCode.toDataURL(text);
    //   console.log(QR);
      return QR;
    } catch (err) {
      console.error(" QR Code generation error ::>> ",err)
    }
};
export default generateQR;