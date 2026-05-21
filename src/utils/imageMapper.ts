export const ProductImages: Record<string, any> = {

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
  

  "bananafeatured": require("../../assets/Featured Products/featuredBanana.png"),
  "grapefeatured": require("../../assets/Featured Products/featuredGrapes.png"),
  "pumpkinfeatured": require("../../assets/Featured Products/featuredPumpkin.png"),
  "showcase1": require("../../assets/Featured Products/showcase1.png"),
  "showcase2": require("../../assets/Featured Products/showcase2.png"),
  "strawberryfeatured": require("../../assets/Featured Products/featuredStrawberry.png"),
};

export const getProductImage = (imageKey: string | undefined) => {
  if (imageKey && ProductImages[imageKey]) {
    return ProductImages[imageKey];
  }

  return ProductImages["coconut"]; 
};
