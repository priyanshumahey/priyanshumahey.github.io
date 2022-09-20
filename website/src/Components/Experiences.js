import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import MultiActionAreaCard from './Shared/ExpCard';
import ModalBlock from './Shared/Modal';


function SimpleAccordion() {
  return (
    <div>
      <Accordion style={{boxShadow:"0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)"}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography><strong>Software Engineer</strong></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            As a software engineer, I primarily 
            <h3>My Skills:</h3>
                <Accordion>
                  <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                  <Typography><strong>General Languages:</strong></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                  <Typography>
                    <img alt="js badge" src='https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black'/>
                    <img alt="typescript badge" src='https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white'/>
                    <img alt="c# badge" src='https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white'/>
                    <img alt="python badge" src='https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white'/>
                    <img alt="html badge" src='https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white'/>
                    <img alt="css badge" src='https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white'/>
                  </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                  <Typography><strong>Front End:</strong></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                  <Typography>
                  <img alt="react badge" src='https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB'/>
                  <img alt="sass badge" src='https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white'/>
                  <img alt="figma badge" src='https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white'/>
                  </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                  <Typography><strong>Back End:</strong></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                  <Typography>
                  <img alt="django badge" src='https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white'/>
                  <img alt="flask badge" src='https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white'/>
                  <img alt=".NET badge" src='https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white'/>
                  </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                  <Typography><strong>Frameworks, Databases, and Cloud Services:</strong></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                  <Typography>
                  <img alt=".NET badge" src='https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white'/>
                  <img alt="GIT badge" src='https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white'/>


                  <img alt="MongoDB badge" src='https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white'/>
                  <img alt="MySQL badge" src='https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white'/>
                  <img alt="AWS badge" src='https://img.shields.io/badge/Amazon_AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white'/>
                  <img alt="Microsoft badge" src='https://img.shields.io/badge/Microsoft_Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white'/>
                  </Typography>
                  </AccordionDetails>
                </Accordion>
            <h3>My Experiences:</h3>
          <div>
            {/* */}
            <MultiActionAreaCard 
              image="https://raw.githubusercontent.com/priyanshumahey/Purple-Lotus/main/site/src/Pages/Intro/Logo.png" 
              alt="Purple Lotus" 
              color="#e9bff2"
              title="Purple Lotus" 
              text="Fullstack Mental Health Application"
              website_but_name = "github"
              website='https://github.com/priyanshumahey/Purple-Lotus'
              extra_button1={<ModalBlock title="Purple Lotus" text={
              <div>
                <h1>Overview</h1>
                <p>Purple Lotus is a mental health application</p>
              </div>
            } 
            />}
            />
            <MultiActionAreaCard 
              image="https://cdn.eso.org/images/screen/eso1907a.jpg"
              color="#fffff"
            />

          </div>  
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion style={{boxShadow:"0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)"}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography><strong>Deep Learning Engineer</strong></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion style={{boxShadow:"0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)"}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography><strong>Researcher</strong></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion style={{boxShadow:"0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)"}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography><strong>Project Management</strong></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion style={{boxShadow:"0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)"}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography><strong>UI/UX Design</strong></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion style={{boxShadow:"0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)"}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography><strong>Internships</strong></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

const accordian_style = {
  justifyContent: 'center',
  textAlign: "center",
  display: "flex",
  
}

function Experiences () {
    return(
      <div style={{paddingBottom:'5vh'}}>
        <div style={{paddingLeft:'2vw', paddingRight:'2vw'}}>
          <h1 >My experiences</h1>
          <h2>I do a variety of different things! Click on a category to learn more about some relevant experiences I have!</h2>
        </div>
          <div style={accordian_style}>
            <div style={{width:'90vw'}}>
              <SimpleAccordion />
            </div>
        </div>
      </div>
    )
  }

export default Experiences;