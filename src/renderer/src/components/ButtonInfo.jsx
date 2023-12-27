import { Flex, Kbd, Text } from "@chakra-ui/react";

function ButtonInfo() {
  return (
    <Flex borderColor={"white"} height={'40px'}  color={'white'} backgroundColor={'#222222'} borderTop={'1px'} padding={'10px'} gap={'5px'}>
    <Text fontSize={'md'}>Toggle Menu</Text>
    <Kbd backgroundColor={'black'}>Alt</Kbd> + <Kbd backgroundColor={'black'}>X</Kbd>
  </Flex>
);
}

export default ButtonInfo;
