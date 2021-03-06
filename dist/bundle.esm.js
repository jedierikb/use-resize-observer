import { useRef, useState, useEffect, useMemo } from 'react';

function useResizeObserver(opts) {
  if (opts === void 0) {
    opts = {};
  }

  // `defaultRef` Has to be non-conditionally declared here whether or not it'll
  // be used as that's how hooks work.
  // @see https://reactjs.org/docs/hooks-rules.html#explanation
  var defaultRef = useRef(null); // Saving the callback as a ref. With this, I don't need to put onResize in the
  // effect dep array, and just passing in an anonymous function without memoising
  // will not reinstantiate the hook's ResizeObserver

  var onResize = opts.onResize;
  var onResizeRef = useRef(undefined);
  onResizeRef.current = onResize; // Using a single instance throughought the hook's lifetime

  var resizeObserverRef = useRef();
  var ref = opts.ref || defaultRef;

  var _useState = useState({
    width: undefined,
    height: undefined
  }),
      size = _useState[0],
      setSize = _useState[1]; // Using a ref to track the previous width / height to avoid unnecessary renders


  var previous = useRef({
    width: undefined,
    height: undefined
  });
  useEffect(function () {
    if (resizeObserverRef.current) {
      return;
    }

    resizeObserverRef.current = new ResizeObserver(function (entries) {
      if (!Array.isArray(entries)) {
        return;
      } // Since we only observe the one element, we don't need to loop over the
      // array


      if (!entries.length) {
        return;
      }

      var entry = entries[0]; // jedierikb says, 'that is not quite right'
      // `Math.round` is in line with how CSS resolves sub-pixel values

      var newWidth = entry.contentRect.width;
      var newHeight = entry.contentRect.height;

      if (previous.current.width !== newWidth || previous.current.height !== newHeight) {
        var newSize = {
          width: newWidth,
          height: newHeight
        };

        if (onResizeRef.current) {
          onResizeRef.current(newSize);
        } else {
          previous.current.width = newWidth;
          previous.current.height = newHeight;
          setSize(newSize);
        }
      }
    });
  }, []);
  useEffect(function () {
    if (typeof ref !== "object" || ref === null || !(ref.current instanceof Element)) {
      return;
    }

    var element = ref.current;
    resizeObserverRef.current.observe(element);
    return function () {
      return resizeObserverRef.current.unobserve(element);
    };
  }, [ref]);
  return useMemo(function () {
    return {
      ref: ref,
      width: size.width,
      height: size.height
    };
  }, [ref, size ? size.width : null, size ? size.height : null]);
}

export default useResizeObserver;
