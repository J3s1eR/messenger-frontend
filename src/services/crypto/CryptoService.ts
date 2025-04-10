
const CryptoService = {

generateBase64Key(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

};

export default CryptoService;