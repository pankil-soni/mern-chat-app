import { useState, useContext } from "react";
import {
  Flex,
  Heading,
  Input,
  Button,
  InputGroup,
  Stack,
  InputLeftElement,
  chakra,
  Box,
  Link,
  Avatar,
  FormControl,
  FormHelperText,
  InputRightElement,
  Card,
  CardBody,
  useToast,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import chatContext from "../../context/chatContext";
import { ArrowBackIcon } from "@chakra-ui/icons";

const CFaLock = chakra(FaLock);

const Login = (props) => {
  const context = useContext(chatContext);
  const { hostName, socket, setUser, setIsAuthenticated, fetchData } = context;
  const toast = useToast();
  const navigator = useNavigate();

  const [email, setemail] = useState();
  const [password, setpassword] = useState();
  const handletabs = props.handleTabsChange;
  const [showPassword, setShowPassword] = useState(false);
  const [forgotpasswordshow, setforgotpasswordshow] = useState(false);
  const [sending, setsending] = useState(false);

  const handleShowClick = () => setShowPassword(!showPassword);

  const showtoast = (title, description, status) => {
    toast({
      title: title,
      description: description,
      status: status,
      duration: 5000,
      isClosable: true,
    });
  };
  const handleLogin = async function (e) {
    e.preventDefault();

    const data = {
      email: email,
    };

    //check if the user is trying to login using otp
    const otp = document.getElementById("otp")?.value;

    if (otp?.length > 0 && forgotpasswordshow) {
      data.otp = otp;
    } else {
      data.password = password;
    }

    try {
      const response = await fetch(`${hostName}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resdata = await response.json();

      if (response.status !== 200) {
        showtoast("An error occurred.", resdata.error, "error");
      } else {
        showtoast("Login successful", "You are now logged in", "success");

        localStorage.setItem("token", resdata.authtoken);
        setUser(await resdata.user);
        socket.emit("setup", await resdata.user._id);
        setIsAuthenticated(true);
        fetchData();
        navigator("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlesendotp = async (e) => {
    e.preventDefault();
    setsending(true);

    const data = {
      email: email,
    };

    try {
      const response = await fetch(`${hostName}/auth/getotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resdata = await response.json();

      setsending(false);

      if (response.status !== 200) {
        showtoast("An error occurred.", resdata.error, "error");
      } else {
        showtoast("otp sent", "otp sent to your email", "success");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Flex
      flexDirection="column"
      width="100wh"
      height="70vh"
      justifyContent="center"
      alignItems="center"
      borderRadius={15}
    >
      <Stack
        flexDir="column"
        mb="2"
        justifyContent="center"
        alignItems="center"
      >
        <Avatar bg="purple.300" />
        <Heading color="pruple.400">Welcome Back</Heading>
        <Card minW={{ base: "90%", md: "468px" }} borderRadius={15} shadow={0}>
          <CardBody p={0}>
            <form>
              <Stack spacing={4}>
                {forgotpasswordshow && (
                  <Tooltip label="login" aria-label="A tooltip">
                    <Button
                      w={"fit-content"}
                      onClick={() => setforgotpasswordshow(false)}
                    >
                      <ArrowBackIcon />
                    </Button>
                  </Tooltip>
                )}
                <FormControl display={"flex"}>
                  <InputGroup
                    borderEndRadius={"10px"}
                    borderStartRadius={"10px"}
                    size={"lg"}
                  >
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email address"
                      focusBorderColor="purple.500"
                      onChange={(e) => setemail(e.target.value)}
                    />
                  </InputGroup>
                  {forgotpasswordshow && (
                    <Button
                      m={1}
                      fontSize={"sm"}
                      onClick={(e) => handlesendotp(e)}
                    >
                      {sending ? <Spinner size="sm" /> : "Send otp"}
                    </Button>
                  )}
                </FormControl>

                {!forgotpasswordshow && (
                  <FormControl>
                    <InputGroup
                      borderEndRadius={"10px"}
                      borderStartRadius={"10px"}
                      size={"lg"}
                    >
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.300"
                        children={<CFaLock color="gray.300" />}
                      />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        focusBorderColor="purple.500"
                        onChange={(e) => setpassword(e.target.value)}
                      />
                      <InputRightElement mx={1}>
                        <Button
                          fontSize={"x-small"}
                          size={"xs"}
                          onClick={handleShowClick}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormHelperText textAlign="right">
                      <Link onClick={() => setforgotpasswordshow(true)}>
                        forgot password?
                      </Link>
                    </FormHelperText>
                  </FormControl>
                )}
                {forgotpasswordshow && (
                  <FormControl>
                    <InputGroup
                      borderEndRadius={"10px"}
                      borderStartRadius={"10px"}
                      size={"lg"}
                    >
                      <Input
                        id={"otp"}
                        type="number"
                        placeholder="enter otp"
                        focusBorderColor="purple.500"
                      />
                    </InputGroup>
                  </FormControl>
                )}
                <Button
                  borderRadius={10}
                  type="submit"
                  variant="solid"
                  colorScheme="purple"
                  width="full"
                  onClick={handleLogin}
                >
                  {forgotpasswordshow ? "Login using otp" : "Login"}
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>
      </Stack>
      <Box>
        New to us?{" "}
        <Link color="purple.500" onClick={() => handletabs(1)}>
          Sign Up
        </Link>
      </Box>
    </Flex>
  );
};

export default Login;
