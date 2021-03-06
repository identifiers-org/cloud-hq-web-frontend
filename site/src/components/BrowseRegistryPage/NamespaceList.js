import React from 'react';
import { connect } from 'react-redux';

// Actions.
import { getNamespacesFromRegistry } from '../../actions/NamespaceList';

// Components.
import NamespaceItem from './NamespaceItem';
import Paginator from '../common/Paginator';

// Config.
import { config } from '../../config/Config';


class NamespaceList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      debounceSearch: undefined,
      namespaceListParams: {
        ...this.props.namespaceListParams,
        content: this.props.query,
        size: 20
      }
    };
  };

  updateNamespaceList = async () => {
    await this.props.getNamespacesFromRegistry(this.state.namespaceListParams);
    this.setState({namespaceListParams: this.props.namespaceListParams});
  };

  componentDidMount() {
    this.updateNamespaceList();
  };


  handleNavigate = (where) => {
    const { namespaceListParams } = this.state;

    if (namespaceListParams.number === where) return;

    this.setState({
      namespaceListParams: {
        ...namespaceListParams,
        number: where
      }
    }, () => this.updateNamespaceList());
  };

  handleAlphabeticSearch = e => {
    const { namespaceListParams } = this.state;

    this.setState({
      namespaceListParams: {
        ...namespaceListParams,
        content: '',
        number: 0,
        prefixStart: e.target.innerText.toLowerCase()
      }
    }, () => {
      this.updateNamespaceList();
    });
  };

  handleSearch = e => {
    const { namespaceListParams } = this.state;

    clearTimeout(this.state.debounceSearch);

    this.setState({
      debounceSearch: setTimeout(() => { this.updateNamespaceList(); }, config.DEBOUNCE_DELAY),
      namespaceListParams: {
        ...namespaceListParams,
        prefixStart: '',
        content: e.currentTarget.value,
        number: 0
      }
    });
  };

  handleSetSize = e => {
    const { namespaceListParams } = this.state;

    this.setState({
      namespaceListParams: {
        ...namespaceListParams,
        size: parseInt(e.target.value),
        number: 0
      }
    }, () => this.updateNamespaceList());
  };


  render() {
    const {
      handleNavigate,
      handleAlphabeticSearch,
      handleSearch,
      handleSetSize,
      state: {
        namespaceListParams: {prefixStart, content, number, size, totalElements, totalPages}
      },
      props: {namespaceList}
    } = this;

    const alphabetSearch = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;


    return (
      <>
        <div className="row">

          {/* ALPHABETIC PAGINATOR */}
          <div className="col col-12 col-xl-8 mt-2 overflow-y-scroll p-1">
            <div className="paginator">
              <ul className="pagination pagination-sm m-0">
                {
                  alphabetSearch.map(letter =>
                    <li
                      key={`alphabet-${letter}`}
                      className={`page-item ${letter.toLowerCase() === prefixStart ? 'active' : ''}`}
                    >
                      <a
                        className={`page-link ${letter.toLowerCase() === prefixStart ? 'active' : ''}`}
                        href="#!"
                        onClick={handleAlphabeticSearch}
                      >
                        {letter}
                      </a>
                    </li>
                  )
                }
              </ul>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="col col-12 col-xl-4 mt-2 p-1">
            <div className="input-group input-group-sm mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="registry-search">Search</span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Input a search query"
                aria-label="Search"
                aria-describedby="registry-search"
                onChange={handleSearch}
                value={content}
              />
            </div>
          </div>
        </div>

        {/* NAMESPACE LIST */}
        <div>
          {
            namespaceList.length === 0 ? (
              <p className="text-center my-5">No items</p>
            ) : (
              <div className="card mb-3 overflow-y-scroll">
                <table className="table table-sm table-striped table-hover table-borderless table-fixed">
                  <thead className="thead-light thead-rounded">
                    <tr>
                      <th className={`${isSmallScreen ? 'small-wide' : 'med'}`}>
                        <i className="icon icon-common icon-list" /> Name
                      </th>
                      <th className={`${isSmallScreen ? 'small-narrow' : 'med'} text-center`}>
                        <i className="icon icon-common icon-address-card" /> Prefix
                      </th>
                      {!isSmallScreen && (
                        <th className="text-center">
                          <i className="icon icon-common icon-info" /> Description
                        </th>
                      )}

                    </tr>
                    </thead>
                    <tbody>
                    {
                      // Page data.
                      namespaceList
                        .sort((a, b) => {
                          const { content } = this.state.namespaceListParams;
                          if (a.prefix.startsWith(content) && !b.prefix.startsWith(content)) {
                            return -1;
                          }

                          if (!a.prefix.startsWith(content) && b.prefix.startsWith(content)) {
                            return 1;
                          }

                          return a.prefix - b.prefix;
                        })
                        .map(namespace => <NamespaceItem key={`namespace-${namespace.prefix}`} {...namespace} />
                      )
                    }
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* FOOTER */}
        <footer>
          <Paginator
            navigate={handleNavigate}
            number={number}
            setSize={handleSetSize}
            size={size}
            totalPages={totalPages}
            totalElements={totalElements}
          />
        </footer>
      </>
    );
  }
}


// Mapping
const mapStateToProps = (state) => {
  return {
    namespaceList: state.registryBrowser.namespaceList,
    namespaceListParams: state.registryBrowser.namespaceListParams
  }
};

const mapDispatchToProps = dispatch => ({
  getNamespacesFromRegistry: (params) => dispatch(getNamespacesFromRegistry(params))
});

export default connect (mapStateToProps, mapDispatchToProps)(NamespaceList);
