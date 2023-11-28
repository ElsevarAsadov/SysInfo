import React from "react";
import { Box, Heading, Icon, Text } from "@chakra-ui/react";
import { motion } from 'framer-motion'

function InfoBox({headerText, info, icon}) {
  return (
    <Box  as={motion.div} initial={{ opacity: 0 }}  className={'flex flex-col gap-2'}>
      <Heading size='xs' textTransform='uppercase'>
        {headerText}
      </Heading>
      <Box className={'flex items-center gap-4 ml-2'}>
        <Icon color={'black'} boxSize={6} as={icon}/>
        <Text className={'user-select'}  fontSize='sm'>
          {info}
        </Text>
      </Box>
    </Box>
  );
}

export default InfoBox;
