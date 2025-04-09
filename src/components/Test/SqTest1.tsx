import { Squircle } from "../ultimate-squircle/squircle-js";

const SquircleTest1Component = () => {
  return (
    <Squircle
      //cornerRadius={10}
      topLeftCornerRadius={60}//Левый верхний
      topRightCornerRadius={15}//Правый верхний
      bottomLeftCornerRadius={30}//Левый нижний
      bottomRightCornerRadius={0}//Правый нижний
      cornerSmoothing={1}
      defaultWidth={400}
      defaultHeight={96}
      className="squircle-container"//bg-white p-4 text-black w-52 h-24
    >
      Squircle!
    </Squircle>
  );
};

export default SquircleTest1Component;