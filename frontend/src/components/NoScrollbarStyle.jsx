function NoScrollbarStyle() {
    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `,
            }}
        />
    );
}

export default NoScrollbarStyle;
