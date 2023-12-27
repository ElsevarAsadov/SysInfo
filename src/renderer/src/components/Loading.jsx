import { Heading, Spinner, Stack } from "@chakra-ui/react";
import { motion } from "framer-motion";

export default function Loading({sysInfos}) {
    return (
        <motion.div animate={{ opacity: sysInfos?.cpuInfo ? 0 : 1 }}
                    initial={{opacity: 1, position: "fixed", inset: 0}}
                    transition={{ duration: sysInfos?.cpuInfo ? .1 : 2}}>
            <Stack
                position={'absolute'}
                top={'50%'}
                left={'50%'}
                color={'white'}
                transform={'translate(-50%, -50%)'}
                zIndex={100}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Spinner color='red.500' />
                <Heading size={'md'}>Loading</Heading>
            </Stack>

        </motion.div>
    );
}

