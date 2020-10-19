import React, { Component, Fragment } from "react";
import Dimensions from "react-dimensions";
import MapGL from "react-map-gl";
import PropTypes from "prop-types";
import { ModalRoute } from "react-router-modal";

import { withRouter } from "react-router-dom";
import { logout } from "../../services/auth";

import Button from "./components/Button";
import { Container, ButtonContainer, PointReference } from "./styles";

import debounce from "lodash/debounce";
import api from "../../services/api";

import Properties from "./components/Properties";
import AddProperty from "../AddProperty";

const TOKEN =
  "pk.eyJ1IjoibGV0dGllcmkiLCJhIjoiY2tkejUzc2JuMTU3NzJ5bnd2a2pmbzJqcyJ9.o0eMrz05GlCYm16mPOxtow";

class Map extends Component {
    state = {
        viewport: {
        latitude: -27.2108001,
        longitude: -49.6446024,
        zoom: 12.8,
        bearing: 0,
        pitch: 0
        },
        properties: [],
        addActivate: false
    };

    static propTypes = {
        containerWidth: PropTypes.number.isRequired,
        containerHeight: PropTypes.number.isRequired
    };

    constructor() {
        super();
        this.updatePropertiesLocalization = debounce(
        this.updatePropertiesLocalization,
        500
        );
    }

    handleLogout = e => {
        logout();
        this.props.history.push("/");
    };

    handleAddProperty = () => {
        const { match, history } = this.props;
        const { latitude, longitude } = this.state.viewport;
        history.push(
          `${match.url}/properties/add?latitude=${latitude}&longitude=${longitude}`
        );
        
        this.setState({ addActivate: false });
      };

    componentDidMount() {
        this.loadProperties();
    }
    
    updatePropertiesLocalization() {
        this.loadProperties();
    }
    
    loadProperties = async () => {
        const { latitude, longitude } = this.state.viewport;
        try {
        const response = await api.get("/properties", {
            params: { latitude, longitude }
        });
        this.setState({ properties: response.data });
        } catch (err) {
        console.log(err);
        }
    };
    
    renderActions() {
        return (
        <ButtonContainer>
            <Button
            color="#fc6963"
            onClick={() => this.setState({ addActivate: true })}
            >
            <i className="fa fa-plus" />
            </Button>
            <Button color="#222" onClick={this.handleLogout}>
            <i className="fa fa-times" />
            </Button>
        </ButtonContainer>
        );
    }

    renderButtonAdd() {
        return (
        this.state.addActivate && (
            <PointReference>
            <i className="fa fa-map-marker" />
            <div>
                <button onClick={this.handleAddProperty} type="button">
                Adicionar
                </button>
                <button
                onClick={() => this.setState({ addActivate: false })}
                className="cancel"
                >
                Cancelar
                </button>
            </div>
            </PointReference>
        )
        );
    }

    render() {
        const { containerWidth: width, containerHeight: height, match } = this.props;
    const { properties, addActivate } = this.state;
        return (
        <Fragment>
            <MapGL
                width={width}
                height={height}
                {...this.state.viewport}
                mapStyle="mapbox://styles/mapbox/dark-v9"
                mapboxApiAccessToken={TOKEN}
                onViewportChange={viewport => this.setState({ viewport })}
                onViewStateChange={this.updatePropertiesLocalization.bind(this)}
            >
                {!addActivate && <Properties match={match} properties={properties} />}
            </MapGL>
            {this.renderActions()}
            {this.renderButtonAdd()}
            <ModalRoute
                path={`${match.url}/properties/add`}
                parentPath={match.url}
                component={AddProperty}
            />
        </Fragment>
        );
    }
}

const DimensionedMap = withRouter(Dimensions()(Map));

const App = () => (
  <Container>
    <DimensionedMap />
  </Container>
);

export default App;