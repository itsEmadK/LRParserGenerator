import styled from "styled-components";
import { motion } from "framer-motion";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useThemeMode } from "./ThemeContext";

const GlassSection = styled.section`
  background: transparent;
  padding: 64px 16px;
`;

const GlassContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const GlassHeader = styled(motion.header)`
  background: ${({ theme }) => theme.glass};
  backdrop-filter: ${({ theme }) => theme.text};
  border-radius: 20px;
  padding: 40px 30px 40px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  position: relative;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin:0 auto;
  // display:flex;
  // justify-content:center;
  // align-items:center;
  position:relative;
  bottom:20px;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.bg};
  -webkit-background-clip: text;
`;

const Subtitle = styled.h3`
  margin-top: 8px;
  opacity: 0.9;
  // display:flex;
  // justify-content:center;
  // align-items:center;
`;

const Text = styled.p`
  margin-top: 12px;
  line-height: 1.6;
  // display:flex;
  // justify-content:center;
  // align-items:center;
`;

const Name = styled.span`
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  font-size:bold;
`;

const Link = styled.a`
  color: ${({ theme }) => theme.text};
  font-weight: 800;
  font-size:bold;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ThemeToggle = styled(IconButton)`
  position: absolute;
  bottom: 25px;
  right: 0px;
  left:63rem;
  transition: transform 0.3s ease;
  &:hover {
    transform: rotate(20deg) scale(1.1);
  }
  .MuiSvgIcon-root{
  fill:${({ theme }) => theme.text};
  }
`;

export default function PageHeader() {
  const { toggle, mode } = useThemeMode();

  return (
    <GlassSection>
      <GlassContainer>
        <GlassHeader
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <ThemeToggle onClick={toggle}>
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </ThemeToggle>

          <Title>Parser Visualizer</Title>
          <Subtitle>
            Enter your context-free grammar to generate the parser
          </Subtitle>

          <Text>
            Created by <Name>  Emad Kheyroddin  </Name>  at Semnan University
          </Text>

          <Text>
            Forked and modified by  <Name>  Abolfazl Khatabi & Pariya Heshmati Noor  </Name> at Semnan
            University
          </Text>

          <Text>
            Inspired by{' '}
            <Link href="https://www.cs.princeton.edu/courses/archive/spring20/cos320/LL1/">
              Princeton University&apos;s LL1 Parser Visualizer 
            </Link>
          </Text>
        </GlassHeader>
      </GlassContainer>
    </GlassSection>
  );
}
