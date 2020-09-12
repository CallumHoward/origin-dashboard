import React, { useEffect, forwardRef } from "react";

interface ICProps {
  indeterminate?: boolean;
}

const useCombinedRefs = (...refs: any[]): React.MutableRefObject<any> => {
  const targetRef = React.useRef();

  React.useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
};

const IndeterminateCheckbox = forwardRef<HTMLInputElement, ICProps>(
  ({ indeterminate, ...rest }, ref: React.Ref<HTMLInputElement>) => {
    const defaultRef = React.useRef(null);
    const combinedRef = useCombinedRefs(ref, defaultRef);

    useEffect(() => {
      if (combinedRef?.current) {
        combinedRef.current.indeterminate = indeterminate ?? false;
      }
    }, [combinedRef, indeterminate]);

    return (
      <React.Fragment>
        <input type="checkbox" ref={combinedRef} {...rest} />
      </React.Fragment>
    );
  }
);

export default IndeterminateCheckbox;
