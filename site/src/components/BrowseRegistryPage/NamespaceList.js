import React from 'react';
import NamespaceItem from './NamespaceItem';
import Paginator from '../common/Paginator';
import EbiSearchService from "../common/EbiSearchService";
import PropTypes from "prop-types";
import { useSearchParams } from 'react-router-dom';
import Spinner from "../common/Spinner";


class NamespaceList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: props.query,
      debounceSearch: undefined,
      namespaceList: [],
      loading: false,
      namespaceListParams: {
        page: 0, size: 20,
        totalPages: 0,
        totalElements: 0
      }
    };

    this.debounceRef = React.createRef();
    this.searchBarRef = React.createRef();
  };

  updateNamespaceList = async (querySuffix = '') => {
    const { page, size } = this.state.namespaceListParams;
    const query = this.searchBarRef.current.value || '*:*';

    this.setState({
      loading: true
    });

    EbiSearchService.queryEbiSearchForRelevantNamespacesWithHitCount(
        query + querySuffix,{
          fields: 'name,prefix,description',
          start: page*size, size
        }
    ).then(([hitCount, namespaces]) => {
      this.setState({
        namespaceList: namespaces,
        namespaceListParams: {
          page, size,
          totalPages: Math.ceil(hitCount/size),
          totalElements: hitCount
        }
      });
    }).finally(() => {
      this.setState({loading: false})
    });
  };

  componentDidMount() {
    this.searchBarRef.current.value = this.props.query;
    this.updateNamespaceList();
  }

  handlePageChange = (page) => {
    const { namespaceListParams } = this.state;

    if (namespaceListParams.page === page) return;

    this.setState({
      namespaceListParams: {
        ...namespaceListParams,
        page: page
      }
    }, () => this.updateNamespaceList());
  };

  handleAlphabeticSearch = e => {
    const { namespaceListParams } = this.state;
    const firstLetter = e.target.innerText.toLowerCase();

    this.setState({
      namespaceListParams: {
        ...namespaceListParams,
        page: 0,
      }
    }, () => {
      this.updateNamespaceList(`AND prefix:${firstLetter}*`);
    });
  };

  handleSearchChange = e => {
    clearTimeout(this.debounceRef.current);
    this.debounceRef.current = setTimeout(() => {
      this.props.setSearchParams({query: e.target.value});
      this.updateNamespaceList();
    }, 500);
  };

  handleSetSize = e => {
    const { namespaceListParams } = this.state;
    this.setState({
      namespaceListParams: {
        ...namespaceListParams,
        size: parseInt(e.target.value),
        page: 0
      }
    }, () => this.updateNamespaceList());
  };


  render() {
    const {
      namespaceList,
      namespaceListParams: {
        page, size,
        totalElements, totalPages
      },
      loading
    } = this.state;

    const prefixStart = null;

    // const alphabetSearch = Object.freeze('#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;


    return (
      <>
        {/*<div className="row"> <!-- Disabled after EBI search integration --> */}
        {/*  /!* ALPHABETIC PAGINATOR *!/*/}
        {/*  <div className="col col-12 col-xl-8 mt-2 overflow-y-scroll p-1">*/}
        {/*    <div className="paginator">*/}
        {/*      <ul className="pagination pagination-sm m-0">*/}
        {/*        {*/}
        {/*          alphabetSearch.map(letter =>*/}
        {/*            <li*/}
        {/*              key={`alphabet-${letter}`}*/}
        {/*              className={`page-item ${letter.toLowerCase() === prefixStart ? 'active' : ''}`}*/}
        {/*            >*/}
        {/*              <button*/}
        {/*                type='button'*/}
        {/*                className={`page-link ${letter.toLowerCase() === prefixStart ? 'active' : ''}`}*/}
        {/*                onClick={this.handleAlphabeticSearch}*/}
        {/*              >*/}
        {/*                {letter}*/}
        {/*              </button>*/}
        {/*            </li>*/}
        {/*          )*/}
        {/*        }*/}
        {/*      </ul>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
        <div className="row">
          <div className="col col-12 col-xl-8 mt-2 overflow-y-scroll p-1 d-none d-md-block">
            <div>
              <Paginator
                navigate={this.handlePageChange}
                number={page}
                setSize={this.handleSetSize}
                size={size}
                totalPages={totalPages}
                totalElements={totalElements}
              />
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="col col-12 col-xl-4 mt-2 p-1">
            <div className="input-group input-group-sm mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text"
                      id="registry-search"
                      title="powered by EBI Search">
                  Search
                </span>
              </div>
              <input
                  type="text"
                  className="form-control"
                  placeholder="Input a search query"
                  role='searchbox'
                  aria-label="Search"
                  aria-describedby="registry-search"
                  onChange={this.handleSearchChange}
                  value={undefined}
                  ref={this.searchBarRef}
              />
            </div>
          </div>
        </div>

        { loading ? <Spinner /> : (
          <div>
            { namespaceList.length === 0 ? <p className="text-center my-5">No items</p> :
              <div className="card mb-3 overflow-y-scroll">
                <table className="table table-sm table-striped table-hover table-borderless table-fixed">
                  <thead className="thead-light thead-rounded">
                    <tr>
                      <th className={`${isSmallScreen ? 'small-wide' : 'wide'}`}>
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
                      namespaceList.map(namespace =>
                          <NamespaceItem key={`namespace-${namespace.prefix}`} {...namespace} />
                      )
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        )}
        {/* FOOTER */}
        <footer className='d-block d-sm-none'>
          <Paginator
              navigate={this.handlePageChange}
              number={page}
              setSize={this.handleSetSize}
              size={size}
              totalPages={totalPages}
              totalElements={totalElements}
          />
        </footer>
      </>
    );
  }
}


NamespaceList.propTypes = {
  setSearchParams: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
}
export default (props) => (
  <NamespaceList {...props} setSearchParams={useSearchParams()[1]} />
)
