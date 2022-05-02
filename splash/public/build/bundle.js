
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Components/Nav.svelte generated by Svelte v3.47.0 */

    const file$4 = "src/Components/Nav.svelte";

    function create_fragment$5(ctx) {
    	let nav;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;
    	let a3;
    	let t7;
    	let li4;
    	let a4;
    	let img0;
    	let img0_src_value;
    	let t8;
    	let li5;
    	let a5;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Download";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "How it works";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Jesteer";
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Meet the team";
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			img0 = element("img");
    			t8 = space();
    			li5 = element("li");
    			a5 = element("a");
    			img1 = element("img");
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-11gg3to");
    			add_location(a0, file$4, 2, 8, 43);
    			attr_dev(li0, "class", "svelte-11gg3to");
    			add_location(li0, file$4, 2, 4, 39);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-11gg3to");
    			add_location(a1, file$4, 3, 8, 81);
    			attr_dev(li1, "class", "svelte-11gg3to");
    			add_location(li1, file$4, 3, 4, 77);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "svelte-11gg3to");
    			add_location(a2, file$4, 4, 26, 141);
    			attr_dev(li2, "class", "nav-brand svelte-11gg3to");
    			add_location(li2, file$4, 4, 4, 119);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "svelte-11gg3to");
    			add_location(a3, file$4, 5, 8, 178);
    			attr_dev(li3, "class", "svelte-11gg3to");
    			add_location(li3, file$4, 5, 4, 174);
    			attr_dev(img0, "width", "25px");
    			if (!src_url_equal(img0.src, img0_src_value = "../img/LinkedInLogo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "LinkedIn");
    			add_location(img0, file$4, 6, 20, 233);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "svelte-11gg3to");
    			add_location(a4, file$4, 6, 8, 221);
    			attr_dev(li4, "class", "svelte-11gg3to");
    			add_location(li4, file$4, 6, 4, 217);
    			attr_dev(img1, "width", "25px");
    			if (!src_url_equal(img1.src, img1_src_value = "../img/GitHubLogo.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Github");
    			add_location(img1, file$4, 7, 57, 363);
    			attr_dev(a5, "href", "https://github.com/oslabs-beta/Jesteer");
    			attr_dev(a5, "class", "svelte-11gg3to");
    			add_location(a5, file$4, 7, 8, 314);
    			attr_dev(li5, "class", "svelte-11gg3to");
    			add_location(li5, file$4, 7, 4, 310);
    			attr_dev(ul, "class", "svelte-11gg3to");
    			add_location(ul, file$4, 1, 2, 30);
    			attr_dev(nav, "class", "nav-container svelte-11gg3to");
    			add_location(nav, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, img0);
    			append_dev(ul, t8);
    			append_dev(ul, li5);
    			append_dev(li5, a5);
    			append_dev(a5, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Components/Intro.svelte generated by Svelte v3.47.0 */

    const file$3 = "src/Components/Intro.svelte";

    function create_fragment$4(ctx) {
    	let div4;
    	let div0;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let div3;
    	let div1;
    	let h3;
    	let t5;
    	let div2;
    	let p1;
    	let t7;
    	let a;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Introducing Jesteer.";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Automatically generate Puppeteer testing suites with Jest.";
    			t3 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "**media";
    			t5 = space();
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = "End-to-end testing has never been easier. With Jesteer, you can automatically create an E2E test suite, simply by navigating your app. Let developers spend more time coding, and less time testing, without sacrificing quality.";
    			t7 = space();
    			a = element("a");
    			a.textContent = "Get it from the Chrome Web Store.";
    			attr_dev(h1, "class", "svelte-1nl78ji");
    			add_location(h1, file$3, 2, 4, 51);
    			attr_dev(p0, "class", "svelte-1nl78ji");
    			add_location(p0, file$3, 3, 4, 85);
    			attr_dev(div0, "class", "header svelte-1nl78ji");
    			add_location(div0, file$3, 1, 2, 26);
    			add_location(h3, file$3, 8, 7, 326);
    			attr_dev(div1, "class", "info-media svelte-1nl78ji");
    			add_location(div1, file$3, 6, 4, 185);
    			add_location(p1, file$3, 11, 6, 388);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-1nl78ji");
    			add_location(a, file$3, 12, 6, 627);
    			attr_dev(div2, "class", "info-text svelte-1nl78ji");
    			add_location(div2, file$3, 10, 4, 358);
    			attr_dev(div3, "class", "info svelte-1nl78ji");
    			add_location(div3, file$3, 5, 2, 162);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h3);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t7);
    			append_dev(div2, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Intro', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Intro> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Intro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Intro",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Components/HowTo.svelte generated by Svelte v3.47.0 */

    const file$2 = "src/Components/HowTo.svelte";

    function create_fragment$3(ctx) {
    	let div13;
    	let h2;
    	let t1;
    	let div12;
    	let div2;
    	let div0;
    	let h30;
    	let t3;
    	let p0;
    	let t5;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let h31;
    	let t7;
    	let div5;
    	let div3;
    	let h32;
    	let t9;
    	let p1;
    	let t11;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let h33;
    	let t13;
    	let div8;
    	let div6;
    	let h34;
    	let t15;
    	let p2;
    	let t17;
    	let div7;
    	let img2;
    	let img2_src_value;
    	let h35;
    	let t19;
    	let div11;
    	let div9;
    	let h36;
    	let t21;
    	let p3;
    	let t23;
    	let div10;
    	let img3;
    	let img3_src_value;
    	let h37;

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			h2 = element("h2");
    			h2.textContent = "How to Use Jesteer";
    			t1 = space();
    			div12 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Record a path through your app.";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ornare magna eros, vitae facilisis magna commodo in. Sed mattis in tortor hendrerit vehicula. Praesent eget nulla tortor. Suspendisse egestas leo in ante semper tempor at id urna.";
    			t5 = space();
    			div1 = element("div");
    			img0 = element("img");
    			h31 = element("h3");
    			h31.textContent = "**media";
    			t7 = space();
    			div5 = element("div");
    			div3 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Select elements for snapshot testing.";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ornare magna eros, vitae facilisis magna commodo in. Sed mattis in tortor hendrerit vehicula. Praesent eget nulla tortor. Suspendisse egestas leo in ante semper tempor at id urna.";
    			t11 = space();
    			div4 = element("div");
    			img1 = element("img");
    			h33 = element("h3");
    			h33.textContent = "**media";
    			t13 = space();
    			div8 = element("div");
    			div6 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Export a full test suite with the click of a button.";
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ornare magna eros, vitae facilisis magna commodo in. Sed mattis in tortor hendrerit vehicula. Praesent eget nulla tortor. Suspendisse egestas leo in ante semper tempor at id urna.";
    			t17 = space();
    			div7 = element("div");
    			img2 = element("img");
    			h35 = element("h3");
    			h35.textContent = "**media";
    			t19 = space();
    			div11 = element("div");
    			div9 = element("div");
    			h36 = element("h3");
    			h36.textContent = "Enjoy!";
    			t21 = space();
    			p3 = element("p");
    			p3.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ornare magna eros, vitae facilisis magna commodo in. Sed mattis in tortor hendrerit vehicula. Praesent eget nulla tortor. Suspendisse egestas leo in ante semper tempor at id urna.";
    			t23 = space();
    			div10 = element("div");
    			img3 = element("img");
    			h37 = element("h3");
    			h37.textContent = "**media";
    			attr_dev(h2, "class", "svelte-zzlkhp");
    			add_location(h2, file$2, 1, 2, 26);
    			add_location(h30, file$2, 5, 8, 149);
    			add_location(p0, file$2, 6, 8, 198);
    			attr_dev(div0, "class", "howTo-text svelte-zzlkhp");
    			add_location(div0, file$2, 4, 6, 116);
    			if (!src_url_equal(img0.src, img0_src_value = "TK.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$2, 9, 8, 500);
    			add_location(h31, file$2, 9, 33, 525);
    			attr_dev(div1, "class", "howTo-media");
    			add_location(div1, file$2, 8, 6, 466);
    			attr_dev(div2, "class", "howTo svelte-zzlkhp");
    			add_location(div2, file$2, 3, 4, 90);
    			add_location(h32, file$2, 15, 8, 630);
    			add_location(p1, file$2, 16, 8, 685);
    			attr_dev(div3, "class", "howTo-text svelte-zzlkhp");
    			add_location(div3, file$2, 14, 6, 597);
    			if (!src_url_equal(img1.src, img1_src_value = "TK.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$2, 19, 8, 987);
    			add_location(h33, file$2, 19, 33, 1012);
    			attr_dev(div4, "class", "howTo-media");
    			add_location(div4, file$2, 18, 6, 953);
    			attr_dev(div5, "class", "howTo svelte-zzlkhp");
    			add_location(div5, file$2, 13, 4, 571);
    			add_location(h34, file$2, 25, 8, 1117);
    			add_location(p2, file$2, 26, 8, 1187);
    			attr_dev(div6, "class", "howTo-text svelte-zzlkhp");
    			add_location(div6, file$2, 24, 6, 1084);
    			if (!src_url_equal(img2.src, img2_src_value = "TK.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$2, 29, 8, 1489);
    			add_location(h35, file$2, 29, 33, 1514);
    			attr_dev(div7, "class", "howTo-media");
    			add_location(div7, file$2, 28, 6, 1455);
    			attr_dev(div8, "class", "howTo svelte-zzlkhp");
    			add_location(div8, file$2, 23, 4, 1058);
    			add_location(h36, file$2, 35, 8, 1619);
    			add_location(p3, file$2, 36, 8, 1643);
    			attr_dev(div9, "class", "howTo-text svelte-zzlkhp");
    			add_location(div9, file$2, 34, 6, 1586);
    			if (!src_url_equal(img3.src, img3_src_value = "TK.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$2, 39, 8, 1945);
    			add_location(h37, file$2, 39, 33, 1970);
    			attr_dev(div10, "class", "howTo-media");
    			add_location(div10, file$2, 38, 6, 1911);
    			attr_dev(div11, "class", "howTo svelte-zzlkhp");
    			add_location(div11, file$2, 33, 4, 1560);
    			attr_dev(div12, "class", "howTo-container svelte-zzlkhp");
    			add_location(div12, file$2, 2, 2, 56);
    			attr_dev(div13, "class", "container");
    			add_location(div13, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, h2);
    			append_dev(div13, t1);
    			append_dev(div13, div12);
    			append_dev(div12, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, img0);
    			append_dev(div1, h31);
    			append_dev(div12, t7);
    			append_dev(div12, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h32);
    			append_dev(div3, t9);
    			append_dev(div3, p1);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, img1);
    			append_dev(div4, h33);
    			append_dev(div12, t13);
    			append_dev(div12, div8);
    			append_dev(div8, div6);
    			append_dev(div6, h34);
    			append_dev(div6, t15);
    			append_dev(div6, p2);
    			append_dev(div8, t17);
    			append_dev(div8, div7);
    			append_dev(div7, img2);
    			append_dev(div7, h35);
    			append_dev(div12, t19);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div9, h36);
    			append_dev(div9, t21);
    			append_dev(div9, p3);
    			append_dev(div11, t23);
    			append_dev(div11, div10);
    			append_dev(div10, img3);
    			append_dev(div10, h37);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HowTo', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HowTo> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class HowTo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HowTo",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Components/Team.svelte generated by Svelte v3.47.0 */

    const file$1 = "src/Components/Team.svelte";

    function create_fragment$2(ctx) {
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let div4;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let p1;
    	let strong0;
    	let t6;
    	let p2;
    	let strong1;
    	let t8;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let p3;
    	let strong2;
    	let t11;
    	let p4;
    	let strong3;
    	let t13;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t14;
    	let p5;
    	let strong4;
    	let t16;
    	let p6;
    	let strong5;
    	let t18;
    	let div3;
    	let img3;
    	let img3_src_value;
    	let t19;
    	let p7;
    	let strong6;
    	let t21;
    	let p8;
    	let strong7;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Meet the team";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Please don't hesitate to reach out to us. (We're all for hire!)";
    			t3 = space();
    			div4 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t4 = space();
    			p1 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Clare Cerullo";
    			t6 = space();
    			p2 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Frontend Engineer";
    			t8 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t9 = space();
    			p3 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Tim Ruszala";
    			t11 = space();
    			p4 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Backend Engineer";
    			t13 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t14 = space();
    			p5 = element("p");
    			strong4 = element("strong");
    			strong4.textContent = "Charissa Ramirez";
    			t16 = space();
    			p6 = element("p");
    			strong5 = element("strong");
    			strong5.textContent = "Frontend Engineer";
    			t18 = space();
    			div3 = element("div");
    			img3 = element("img");
    			t19 = space();
    			p7 = element("p");
    			strong6 = element("strong");
    			strong6.textContent = "Katie Janzen";
    			t21 = space();
    			p8 = element("p");
    			strong7 = element("strong");
    			strong7.textContent = "Backend Engineer";
    			attr_dev(h2, "align", "center");
    			add_location(h2, file$1, 0, 0, 0);
    			attr_dev(p0, "align", "center");
    			add_location(p0, file$1, 1, 0, 38);
    			if (!src_url_equal(img0.src, img0_src_value = "../img/clare.jpeg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "100px");
    			attr_dev(img0, "alt", "Clare Cerullo");
    			attr_dev(img0, "class", "svelte-1vy97k");
    			add_location(img0, file$1, 4, 4, 170);
    			add_location(strong0, file$1, 5, 7, 241);
    			add_location(p1, file$1, 5, 4, 238);
    			add_location(strong1, file$1, 6, 7, 283);
    			add_location(p2, file$1, 6, 4, 280);
    			attr_dev(div0, "class", "member svelte-1vy97k");
    			add_location(div0, file$1, 3, 2, 145);
    			if (!src_url_equal(img1.src, img1_src_value = "../img/tim.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "width", "100px");
    			attr_dev(img1, "alt", "Tim Ruszala");
    			attr_dev(img1, "class", "svelte-1vy97k");
    			add_location(img1, file$1, 9, 4, 358);
    			add_location(strong2, file$1, 10, 7, 425);
    			add_location(p3, file$1, 10, 4, 422);
    			add_location(strong3, file$1, 11, 7, 465);
    			add_location(p4, file$1, 11, 4, 462);
    			attr_dev(div1, "class", "member svelte-1vy97k");
    			add_location(div1, file$1, 8, 2, 333);
    			if (!src_url_equal(img2.src, img2_src_value = "../img/cha.jpeg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "width", "100px");
    			attr_dev(img2, "alt", "Charissa Ramirez");
    			attr_dev(img2, "class", "svelte-1vy97k");
    			add_location(img2, file$1, 14, 4, 539);
    			add_location(strong4, file$1, 15, 7, 611);
    			add_location(p5, file$1, 15, 4, 608);
    			add_location(strong5, file$1, 16, 7, 656);
    			add_location(p6, file$1, 16, 4, 653);
    			attr_dev(div2, "class", "member svelte-1vy97k");
    			add_location(div2, file$1, 13, 2, 514);
    			if (!src_url_equal(img3.src, img3_src_value = "../img/katie.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "width", "100px");
    			attr_dev(img3, "alt", "Katie Janzen");
    			attr_dev(img3, "class", "svelte-1vy97k");
    			add_location(img3, file$1, 19, 4, 731);
    			add_location(strong6, file$1, 20, 7, 800);
    			add_location(p7, file$1, 20, 4, 797);
    			add_location(strong7, file$1, 21, 7, 841);
    			add_location(p8, file$1, 21, 4, 838);
    			attr_dev(div3, "class", "member svelte-1vy97k");
    			add_location(div3, file$1, 18, 2, 706);
    			attr_dev(div4, "class", "team svelte-1vy97k");
    			add_location(div4, file$1, 2, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t4);
    			append_dev(div0, p1);
    			append_dev(p1, strong0);
    			append_dev(div0, t6);
    			append_dev(div0, p2);
    			append_dev(p2, strong1);
    			append_dev(div4, t8);
    			append_dev(div4, div1);
    			append_dev(div1, img1);
    			append_dev(div1, t9);
    			append_dev(div1, p3);
    			append_dev(p3, strong2);
    			append_dev(div1, t11);
    			append_dev(div1, p4);
    			append_dev(p4, strong3);
    			append_dev(div4, t13);
    			append_dev(div4, div2);
    			append_dev(div2, img2);
    			append_dev(div2, t14);
    			append_dev(div2, p5);
    			append_dev(p5, strong4);
    			append_dev(div2, t16);
    			append_dev(div2, p6);
    			append_dev(p6, strong5);
    			append_dev(div4, t18);
    			append_dev(div4, div3);
    			append_dev(div3, img3);
    			append_dev(div3, t19);
    			append_dev(div3, p7);
    			append_dev(p7, strong6);
    			append_dev(div3, t21);
    			append_dev(div3, p8);
    			append_dev(p8, strong7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Team', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Team extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Components/Footer.svelte generated by Svelte v3.47.0 */

    const file = "src/Components/Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let p;
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p = element("p");
    			t0 = text("Jesteer is an open source product. If you'd like to contribute, send us an email at ");
    			a = element("a");
    			a.textContent = "email@gmail.com";
    			attr_dev(a, "href", "mailto:email@gmail.com");
    			attr_dev(a, "class", "svelte-m7e46");
    			add_location(a, file, 1, 89, 98);
    			add_location(p, file, 1, 2, 11);
    			attr_dev(footer, "class", "svelte-m7e46");
    			add_location(footer, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p);
    			append_dev(p, t0);
    			append_dev(p, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.47.0 */

    function create_fragment(ctx) {
    	let nav;
    	let t0;
    	let intro;
    	let t1;
    	let howto;
    	let t2;
    	let team;
    	let t3;
    	let footer;
    	let current;
    	nav = new Nav({ $$inline: true });
    	intro = new Intro({ $$inline: true });
    	howto = new HowTo({ $$inline: true });
    	team = new Team({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			create_component(intro.$$.fragment);
    			t1 = space();
    			create_component(howto.$$.fragment);
    			t2 = space();
    			create_component(team.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(intro, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(howto, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(team, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro$1(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(intro.$$.fragment, local);
    			transition_in(howto.$$.fragment, local);
    			transition_in(team.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(intro.$$.fragment, local);
    			transition_out(howto.$$.fragment, local);
    			transition_out(team.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(intro, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(howto, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(team, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Nav, Intro, HowTo, Team, Footer });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: 'Harlequin'
      }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
