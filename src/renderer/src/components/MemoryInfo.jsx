import { motion } from "framer-motion";
import { Box, Heading, HStack, List, ListIcon, ListItem, Stack, Text } from "@chakra-ui/react";


export default function MemoryInfo({headerText, icon, info}) {
    console.log("INFO", info)
    return (
        <Box  as={motion.div} initial={{ opacity: 0 }}  className={'flex flex-col gap-2'}>

            <Heading size='xs' textTransform='uppercase'>
                {headerText}
            </Heading>

            <Stack className={'flex items-center gap-4 ml-2'}>


                    <List spacing={3} alignSelf={'start'}>
                        {
                            info?.sockets.map(s=>{
                                return (
                                    <ListItem>
                                        <ListIcon  as={icon}/>
                                        <Text fontSize={'sm'}>{s}</Text>
                                    </ListItem>
                                )
                            })
                        }
                        <ListItem>
                            <HStack size={'lg'} fontWeight={'bold'} gap={'10px'} >

                                <Text size={'lg'}>Total:</Text>
                                <Text color={'green'} fontStyle={'italic'}>
                                    {info?.total}
                                </Text>
                            </HStack>
                        </ListItem>
                    </List>

            </Stack>
        </Box>
    );
}

