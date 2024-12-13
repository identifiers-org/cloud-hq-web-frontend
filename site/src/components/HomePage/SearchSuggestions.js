import React, { forwardRef, useCallback, useEffect, useState, useImperativeHandle } from 'react';
import PropTypes from "prop-types";
import { config } from "../../config/Config";
import { useNavigate } from "react-router-dom";
import { querySplit } from "../../utils/identifiers";
import EbiSearchService from "../common/EbiSearchService";

const SearchSuggestions = forwardRef((props, ref) => {
  const { query } = props;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [namespaceList, setNamespaceList] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState(-1);
  const [debounce, setDebounce] = useState(0);

  const handleSuggestionInteraction = useCallback(
    (prefix) => navigate(`/registry/${prefix}`),
    [navigate]
  );

  const handleSelectedNamespace = useCallback(
    async (index) => {
      setSelectedNamespace(index);
    }, [setSelectedNamespace]
  );

  const updateNamespaces = useCallback(async () => {
      if (query) {
        const { prefix } = querySplit(query);
        const namespaces = (
          await EbiSearchService.queryEbiSearchForRelevantNamespaces(
            query, {
              fields: 'name,prefix,lui_pattern,sample_id'
            }
          )
        )?.slice(0, config.suggestionQuerySize) || [];

        setNamespaceList(namespaces);
        setSelectedNamespace(namespaces.findIndex(ns => ns.prefix === prefix))
      }
      setLoading(false)
    },
    [query, setNamespaceList, setSelectedNamespace, setLoading],
  );

  useImperativeHandle(ref, () => ({
    hasSelection() {
      return selectedNamespace !== -1;
    },

    async clearSelection() {
      setSelectedNamespace(-1);
    },

    async clickSelection() {
      if (selectedNamespace === -1) return;

      const prefix = namespaceList[selectedNamespace].prefix;
      document.getElementById(`suggestion-${prefix}`)?.click();
    },

    async upSelection(n = 1) {
      if (selectedNamespace === 0 || namespaceList.length === 0) return;

      let newPosition = -1;
      if (selectedNamespace === -1) {
        if (namespaceList.length !== 0) newPosition = 0;
      } else {
        newPosition = Math.max(0, selectedNamespace-n);
      }

      setSelectedNamespace(newPosition)
    },

    async downSelection(n = 1){
      if (selectedNamespace === namespaceList.length-1 || namespaceList.length === 0) return;

      let newPosition = -1;
      if (selectedNamespace === -1) {
        if (namespaceList.length !== 0) newPosition = 0;
      } else {
        newPosition = Math.min(namespaceList.length-1, selectedNamespace+n)
      }
      setSelectedNamespace(newPosition)
    }
  }), [selectedNamespace, setSelectedNamespace, namespaceList])

  useEffect(() => {
    clearTimeout(debounce);
    setDebounce(setTimeout(
      updateNamespaces,
      600
    ));
    return () => clearTimeout(debounce);
  }, [query, updateNamespaces, setDebounce]);

  return (
    <div className="inline-search-container">
      <div className="suggestions-box">
        <div className="row mx-1">
          <div className="col align-self-end">
            <p className="text-muted text-right my-0"><small>Suggestions</small></p>
          </div>
        </div>

        <ul className="suggestion-list pb-2">
          {
            !loading && namespaceList.map((namespace, index) => (
              <li
                key={`li-suggestion-${namespace.prefix}`}
                className={`suggestion ${selectedNamespace === index ? 'suggestion__selected' : ''}`}
              >
                <div className="row no-gutters py-1 mx-2">
                  <div className="col">
                    <button
                      type='button'
                      className="clear-link d-flex align-items-center"
                      id={`suggestion-${namespace.prefix}`}
                      onMouseOver={() => {
                        handleSelectedNamespace(index)
                      }}
                      onFocus={() => {
                        handleSelectedNamespace(index)
                      }}
                      onClick={() => {
                        handleSuggestionInteraction(namespace.prefix)
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return
                        handleSuggestionInteraction(namespace.prefix)
                      }}
                    >
                      <span
                        className={`badge ${selectedNamespace === index ? 'badge-secondary border border-dark' : 'badge-dark border border-secondary'} font-weight-normal`}>
                          {namespace.prefix}
                      </span>
                      <p
                        className={`mb-0 ml-2 ${selectedNamespace === index ? 'text-white' : ''}`}
                      >
                        {namespace.name}
                      </p>
                    </button>
                  </div>
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
})

SearchSuggestions.propTypes = {
  query: PropTypes.string.isRequired,
}
export default React.memo(SearchSuggestions,(p1, p2) => p1.query === p2.query);
