import { Container, Row } from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
// import { StatRightTopIcon } from "../widgets/stats/StatRightTopIcon";
// import type { ProjectsStatsProps } from "../types";
// import { Briefcase, ListTask, People, Bullseye } from "react-bootstrap-icons";
// const ProjectsStats: ProjectsStatsProps[] = [
//   {
//     id: 1,
//     title: "Projects",
//     value: 18,
//     icon: <Briefcase size={18} />,
//     statInfo: '<span className="text-dark me-2">2</span> Completed',
//   },
//   {
//     id: 2,
//     title: "Active Task",
//     value: 132,
//     icon: <ListTask size={18} />,
//     statInfo: '<span className="text-dark me-2">28</span> Completed',
//   },
//   {
//     id: 3,
//     title: "Teams",
//     value: 12,
//     icon: <People size={18} />,
//     statInfo: '<span className="text-dark me-2">1</span> Completed',
//   },
//   {
//     id: 4,
//     title: "Productivity",
//     value: "76%",
//     icon: <Bullseye size={18} />,
//     statInfo: '<span className="text-dark me-2">5%</span> Completed',
//   },
// ];
export default function Dashboard() {
  return (
    <Container fluid className="p-6">
      <PageHeading heading="Dashboard" />
      <Row>
        {/* {ProjectsStats.map((item, index) => {
          return (
            <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
              <StatRightTopIcon info={item} />
            </Col>
          );
        })} */}
      </Row>
    </Container>
  );
}
