const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');

// for image safety check, for now disabled

let model;
const loadModel = async () => {
  model = await nsfw.load(); // Load model once at startup
};

const isImageSafe = async (imageBuffer) => {
  const image = await tf.node.decodeImage(imageBuffer);
  const predictions = await model.classify(image);
  image.dispose(); // Clean up TensorFlow memory

  // Block if "porn" or "hentai" confidence exceeds threshold (e.g., 0.7)
  const unsafePrediction = predictions.find(
    (pred) => 
      (pred.className === 'Porn' || pred.className === 'Hentai') && 
      pred.probability > 0.7
  );

  return !unsafePrediction;
};

module.exports = { loadModel, isImageSafe };
