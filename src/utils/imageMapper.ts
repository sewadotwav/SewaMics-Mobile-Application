export const ProductImages: Record<string, any> = {
  // Products
  "coconut": require("../../assets/Products/coconut.jpg"),
  "eggplant": require("../../assets/Products/eggplant.jpg"),
  "fish": require("../../assets/Products/fish.jpg"),
  "frog": require("../../assets/Products/frog.jpg"),
  "orange": require("../../assets/Products/orange.jpg"),
  "parrot": require("../../assets/Products/parrot.jpg"),
  "pineapple": require("../../assets/Products/pineapple.jpg"),
  "pumpkin": require("../../assets/Products/pumpkin.jpg"),
  "strawberry": require("../../assets/Products/strawberry.jpg"),
  "tomato": require("../../assets/Products/tomato.jpg"),
  
  // Featured / Fallbacks
  "bananafeatured": require("../../assets/Featured Products/bananafeatured.jpg"),
  "grapefeatured": require("../../assets/Featured Products/grapefeatured.jpg"),
  "pumpkinfeatured": require("../../assets/Featured Products/pumpkinfeatured.jpg"),
  "showcase1": require("../../assets/Featured Products/showcase1.jpg"),
  "showcase2": require("../../assets/Featured Products/showcase2.jpg"),
  "strawberryfeatured": require("../../assets/Featured Products/strawberryfeatured.jpg"),
};

export const getProductImage = (imageKey: string | undefined) => {
  if (imageKey && ProductImages[imageKey]) {
    return ProductImages[imageKey];
  }
  // Fallback if imageKey doesn't match
  return ProductImages["coconut"]; 
};
